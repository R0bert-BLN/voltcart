# Voltcart

Electronics store: Laravel 13 API (`backend/`) and React 19 app (`frontend/`), built ticket by ticket from the Voltcart mockup (`/home/robert/projects/mockups/projects/voltcart`). Everything runs in Docker; nothing is installed on the host.

## Run
```bash
docker compose up -d --wait                                   # db, backend (FrankenPHP), frontend (Vite)
docker compose exec -T backend php artisan migrate --seed
./bin/verify                                                  # pint, phpstan, types, pest, oxlint, tsc, vitest
```
App http://localhost:5173 · API http://localhost:8000 · Postgres localhost:5432 (`voltcart` / `voltcart`).

## Dark factory
`factory/run.mjs` builds the Kanzo board (`voltcart`) with the local model, one ticket at a time:

1. Takes the top ticket in **todo** that is not flagged human. If a ticket it depends on is not in review or done (or was skipped), it flags the ticket human, tags it `blocked` and moves on.
2. Moves it to **doing** and runs `pi -p` (model `llama-cpp/ornith`) with the ticket text and the rules (AGENTS.md is loaded by pi).
3. Accepts the attempt only when files changed, no protected file changed (`compose.yaml`, `docker/`, `bin/`, `factory/`, `AGENTS.md`) and `./bin/verify` exits 0. Then commits `Tnn: title` and moves the card to **review** with a comment.
4. A failed attempt is reset (git, dependencies, dev database) and retried with the errors in the prompt. After 5 failures the ticket stays in todo, flagged human and tagged `skipped`, with the last errors in a comment.

```bash
node factory/run.mjs --dry-run      # which ticket comes next, without changing anything
node factory/run.mjs --once         # one ticket
node factory/run.mjs                # until todo has nothing left for the factory
```
Options: `--attempts 5`, `--timeout 30` (minutes per attempt), `--project voltcart`; env `FACTORY_MODEL`, `FACTORY_LLM_URL`, `KANZO_URL`. Logs and pi sessions: `factory/runs/Tnn/`. Ctrl+C resets the attempt in progress and returns its card to todo.

To hand a skipped or blocked ticket back: fix the cause (or the ticket text), clear its human flag and the tag on the board.
