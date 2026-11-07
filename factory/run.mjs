#!/usr/bin/env node
// Dark factory: takes the top "todo" ticket from Kanzo, hands it to the local model through pi,
// accepts it only when ./bin/verify passes, commits it and moves it to "review".
// A ticket that fails MAX_ATTEMPTS times is skipped; tickets that depend on it are blocked.
// Skipped and blocked tickets stay in "todo", flagged human, so agents pass over them.
//
//   node factory/run.mjs [--once] [--dry-run] [--attempts 5] [--timeout 30] [--project voltcart]
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name, def) => { const i = process.argv.indexOf(`--${name}`); return i > 0 ? process.argv[i + 1] : def; };
const flag = (name) => process.argv.includes(`--${name}`);
const CFG = {
  project: arg('project', process.env.FACTORY_PROJECT || 'voltcart'),
  attempts: Number(arg('attempts', process.env.FACTORY_ATTEMPTS || 5)),
  timeoutMin: Number(arg('timeout', process.env.FACTORY_TIMEOUT_MIN || 30)),
  kanzo: process.env.KANZO_URL || 'http://127.0.0.1:4242',
  llm: process.env.FACTORY_LLM_URL || 'http://127.0.0.1:8080/v1/models',
  model: process.env.FACTORY_MODEL || 'llama-cpp/ornith',
  once: flag('once'),
  dry: flag('dry-run'),
};
// The model may not change the factory, the containers or the gate
const PROTECTED = ['compose.yaml', 'docker/', 'bin/', 'factory/', 'AGENTS.md', '.gitignore'];
const RUNS = path.join(ROOT, 'factory/runs');

const log = (...a) => console.log(`[${new Date().toLocaleTimeString('en-GB')}]`, ...a);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sh = (cmd, args, opts = {}) => spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 << 20, ...opts });
const git = (...args) => { const r = sh('git', args); if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`); return r.stdout.trim(); };
const tail = (s, n = 6000) => (s.length > n ? `…\n${s.slice(-n)}` : s);

// ---------- Kanzo: reads through the REST API, writes through MCP ----------
let session; let seq = 0;
async function mcp(method, params, notify = false) {
  const body = notify ? { jsonrpc: '2.0', method, params } : { jsonrpc: '2.0', id: ++seq, method, params };
  const res = await fetch(`${CFG.kanzo}/mcp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream', ...(session ? { 'Mcp-Session-Id': session } : {}) },
    body: JSON.stringify(body),
  });
  session = res.headers.get('mcp-session-id') || session;
  if (notify) return null;
  const text = await res.text();
  const json = JSON.parse(text.includes('data:') ? text.split('\n').filter((l) => l.startsWith('data:')).map((l) => l.slice(5)).join('') : text);
  if (json.error) throw new Error(`${method}: ${json.error.message}`);
  return json.result;
}
async function tool(name, args) {
  if (!session) {
    await mcp('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'factory', version: '1' } });
    await mcp('notifications/initialized', {}, true);
  }
  const r = await mcp('tools/call', { name, arguments: args });
  const text = (r.content || []).map((c) => c.text).join('\n');
  if (r.isError) throw new Error(`${name}: ${text}`);
  return text;
}
const getTask = async (id) => (await (await fetch(`${CFG.kanzo}/api/tasks/${id}`)).json()).task;
const comment = (id, body) => (CFG.dry ? log(`(dry) comment on #${id}`) : tool('add_comment', { id: `${CFG.project}#${id}`, author: 'factory', body }));
const update = (id, fields) => (CFG.dry ? log(`(dry) update #${id}`, fields) : tool('update_task', { id: `${CFG.project}#${id}`, ...fields }));

// "voltcart#5 [todo] T05 · Catalogue tables: products {extra, backend}" → {id, status, key, tags}
async function listTasks() {
  const text = await tool('list_tasks', { project: CFG.project, status: 'all' });
  return text.split('\n').map((l) => l.match(/^\S+#(\d+) \[(\w+)\] (T\d+) · .*?(?:\{([^}]*)\})?$/)).filter(Boolean)
    .map(([, id, status, key, tags]) => ({ id: Number(id), status, key, tags: (tags || '').split(',').map((t) => t.trim()).filter(Boolean) }));
}
const finished = (t) => ['review', 'done'].includes(t.status) && !t.tags.some((x) => ['skipped', 'blocked'].includes(x));

// ---------- One ticket ----------
const depsOf = (description) => [...((description.match(/^- Depends on: (.*)$/m) || [])[1] || '').matchAll(/\bT\d{2,3}\b/g)].map((m) => m[0]);
const stripHowTo = (description) => description.replace(/\n*-{3}\s*\n+### How to work[\s\S]*$/, '').trim();

function prompt(task, previous) {
  return [
    'You are implementing exactly one ticket in this repository, on your own: nobody will answer questions.',
    'AGENTS.md describes the stack, the layout and the commands. The Docker stack is already running.',
    '',
    `# Ticket ${task.title}`,
    '',
    stripHowTo(task.description),
    '',
    '# Rules',
    '- Read only the files the ticket names and the files they import. Mockup paths outside this repository are a visual reference only.',
    '- Run every PHP, Composer, Artisan, Node and pnpm command through `docker compose exec -T backend …` or `docker compose exec -T frontend …`. Never install anything on the host.',
    `- Never change ${PROTECTED.map((p) => `\`${p}\``).join(', ')}.`,
    '- Do not run git commands and do not commit: the factory commits for you. Do not use the Kanzo board.',
    '- Keep the change to what the ticket asks for. Write the tests the ticket asks for.',
    '- You are done only when `./bin/verify` exits 0. Run it, read the errors, fix them, and run it again.',
    '- Finish with a short summary (3 to 6 lines): files changed and anything left open.',
    previous ? `\n# The previous attempt failed\nThe repository was reset to the state before it. Avoid the same mistake.\n\n${previous}` : '',
  ].join('\n');
}

function runPi(text, logFile, sessionDir) {
  return new Promise((resolve) => {
    const out = fs.createWriteStream(logFile);
    const child = spawn('pi', ['-p', '--model', CFG.model, '--session-dir', sessionDir, text], { cwd: ROOT, detached: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let buf = '';
    const keep = (d) => { out.write(d); buf = (buf + d).slice(-20000); };
    child.stdout.on('data', keep);
    child.stderr.on('data', keep);
    current.child = child;
    const timer = setTimeout(() => { keep(`\n[factory] timeout after ${CFG.timeoutMin} min\n`); try { process.kill(-child.pid, 'SIGKILL'); } catch {} }, CFG.timeoutMin * 60_000);
    child.on('close', (code) => { clearTimeout(timer); current.child = null; out.end(); resolve({ code, output: buf }); });
  });
}

function verify(logFile) {
  const r = sh(path.join(ROOT, 'bin/verify'), [], { env: { ...process.env, NO_COLOR: '1' } });
  const output = `${r.stdout}\n${r.stderr}`.replace(/\x1b\[[0-9;]*m/g, '');
  fs.writeFileSync(logFile, output);
  return { ok: r.status === 0, output };
}

// Back to the commit before the attempt: files, untracked files, dependencies and the dev database
function resetTo(base) {
  git('reset', '--hard', base);
  git('clean', '-fdq', '--', '.', ':!factory/runs');
  sh('docker', ['compose', 'exec', '-T', 'backend', 'composer', 'install', '-q', '--no-interaction']);
  sh('docker', ['compose', 'exec', '-T', 'frontend', 'pnpm', 'install', '--frozen-lockfile', '--silent']);
  sh('docker', ['compose', 'exec', '-T', 'backend', 'php', 'artisan', 'migrate:fresh', '--force', '-q']);
}

async function waitForModel() {
  for (let i = 0; ; i++) {
    try { if ((await fetch(CFG.llm)).ok) return; } catch {}
    if (i % 10 === 0) log(`model not reachable at ${CFG.llm}; waiting`);
    await sleep(30_000);
  }
}

const current = { task: null, base: null, child: null };

async function work(task) {
  const key = task.title.split(' ')[0];
  const dir = path.join(RUNS, key);
  fs.mkdirSync(dir, { recursive: true });
  const base = git('rev-parse', 'HEAD');
  current.task = task; current.base = base;
  await update(task.id, { status: 'doing' });
  let previous = '';

  for (let attempt = 1; attempt <= CFG.attempts; attempt++) {
    await waitForModel();
    sh('docker', ['compose', 'up', '-d', '--wait', '--quiet-pull']);
    log(`${key} attempt ${attempt}/${CFG.attempts}`);
    const pi = await runPi(prompt(task, previous), path.join(dir, `attempt-${attempt}.log`), path.join(dir, 'sessions'));

    const changed = git('status', '--porcelain').split('\n').filter(Boolean).map((l) => l.slice(3).replace(/^"|"$/g, ''));
    const touched = changed.filter((f) => PROTECTED.some((p) => f === p || f.startsWith(p)) && !f.startsWith('factory/runs'));
    let reason = '';
    let detail = '';
    if (!changed.length) reason = 'no files changed';
    else if (touched.length) reason = `changed protected files: ${touched.join(', ')}`;
    else {
      const v = verify(path.join(dir, `verify-${attempt}.log`));
      if (v.ok) {
        git('add', '-A');
        git('commit', '-q', '-m', `${key}: ${task.title.replace(/^T\d+ · /, '').slice(0, 64)}`);
        const stat = git('show', '--stat', '--format=%h %s', 'HEAD');
        await comment(task.id, `Done by the factory on attempt ${attempt}/${CFG.attempts}; \`./bin/verify\` passed.\n\n\`\`\`\n${stat}\n\`\`\`\n\n**Model summary**\n\n${tail(pi.output.trim(), 1500)}`);
        await update(task.id, { status: 'review' });
        log(`${key} ✔ committed ${stat.split('\n')[0]}`);
        current.task = null;
        return true;
      }
      reason = './bin/verify failed';
      detail = tail(v.output, 5000);
    }
    log(`${key} ✘ attempt ${attempt}: ${reason}`);
    previous = `Reason: ${reason}.${pi.code !== 0 ? ` pi exited with code ${pi.code}.` : ''}\n${detail ? `\nLast verify output:\n\`\`\`\n${detail}\n\`\`\`` : ''}\nYour final message was:\n${tail(pi.output.trim(), 1200)}`;
    await comment(task.id, `Attempt ${attempt}/${CFG.attempts} failed: ${reason}.${detail ? `\n\n\`\`\`\n${tail(detail, 2500)}\n\`\`\`` : ''}`);
    resetTo(base);
  }

  current.task = null;
  await update(task.id, { status: 'todo', human: true, tags: [...new Set([...task.tags, 'skipped'])].join(',') });
  await comment(task.id, `Skipped after ${CFG.attempts} failed attempts. Logs: \`factory/runs/${key}/\`. Fix it by hand (or improve the ticket), then clear the human flag and the \`skipped\` tag to hand it back to the factory.`);
  log(`${key} skipped after ${CFG.attempts} attempts`);
  return false;
}

// ---------- Main loop ----------
async function main() {
  if (git('status', '--porcelain', '--', '.', ':!factory/runs')) throw new Error('The working tree is not clean; commit or stash first.');
  log(`factory: project ${CFG.project}, model ${CFG.model}, ${CFG.attempts} attempts, ${CFG.timeoutMin} min each${CFG.dry ? ', dry run' : ''}`);

  for (;;) {
    const all = await listTasks();
    const byKey = new Map(all.map((t) => [t.key, t]));
    let next = null;
    for (const t of all.filter((x) => x.status === 'todo')) {
      const task = await getTask(t.id);
      if (task.human) continue;
      task.tags = t.tags;
      const waiting = depsOf(task.description).filter((d) => byKey.get(d) && !finished(byKey.get(d)));
      if (waiting.length) {
        // Still in todo, so later tickets that depend on this one see it as unfinished too
        log(`${t.key} blocked by ${waiting.join(', ')}`);
        await update(t.id, { human: true, tags: [...new Set([...t.tags, 'blocked'])].join(',') });
        await comment(t.id, `Blocked: waits for ${waiting.join(', ')} (skipped, blocked or for a person). Clear the human flag and the \`blocked\` tag when they are finished.`);
        continue;
      }
      next = task;
      break;
    }
    if (!next) { log('no ticket left for the factory in todo'); return; }
    if (CFG.dry) { log(`(dry) next: ${next.title}`); return; }
    await work(next);
    if (CFG.once) return;
  }
}

let stopping = false;
process.on('SIGINT', async () => {
  if (stopping) process.exit(130);
  stopping = true;
  log('stopping: resetting the attempt in progress');
  if (current.child) { try { process.kill(-current.child.pid, 'SIGKILL'); } catch {} }
  if (current.task) {
    resetTo(current.base);
    await update(current.task.id, { status: 'todo' }).catch(() => {});
  }
  process.exit(130);
});

main().catch((e) => { console.error(e); process.exit(1); });
