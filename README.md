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
The board (Kanzo project `voltcart`) is built unattended by protokit's factory, run from the mockups repository. Its settings are in `/home/robert/projects/mockups/plans/voltcart/stack.md` (agent: pi with Ornith, gate `./bin/verify`, cleanup `./bin/reset`).

```bash
cd /home/robert/projects/mockups
node scripts/pk.mjs factory voltcart --dry-run   # the next ticket; changes nothing
node scripts/pk.mjs factory voltcart --once      # one ticket
node scripts/pk.mjs factory voltcart             # until todo has nothing left for it
```
Each passing ticket is one commit `Tnn: title` here and a card in review; logs are in `.factory/Tnn/` (not tracked). How it works: `/home/robert/projects/mockups/docs/build-plan.md`, section Dark factory.
