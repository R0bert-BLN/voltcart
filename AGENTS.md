# AGENTS.md
- Stack: Laravel 13 + spatie/laravel-data + Sanctum API tokens + Postgres (backend/), React 19 + TypeScript + TanStack Router/Query + Tailwind 4 + shadcn/ui (frontend/), all in Docker Compose.
- Nothing runs on the host: use `docker compose exec backend …` (php, composer, artisan) and `docker compose exec frontend …` (pnpm).
- Tickets come from the Kanzo board. Each ticket holds its design notes inline; mockup paths are a visual reference, not code to port.
- Backend: endpoints take and return spatie-data DTOs from `app/Data/`; business logic lives in `app/Services/` and controllers only validate requests and call services; money is integer cents; after changing DTOs run `php artisan typescript:transform`.
- Frontend: data only through the hooks in `src/api/queries/`; styles only through theme tokens and Tailwind classes, no raw colours.
- Before finishing a ticket: `./bin/verify` passes. Commit as `Tnn: summary` (one line, no description, no trailers).
- Never change files outside the ticket's scope. If blocked, explain why in the final message and stop.

## Commands
| Task | Command |
|---|---|
| Start everything | `docker compose up -d --wait` |
| The gate (style, static analysis, types) | `./bin/verify` |
| Artisan | `docker compose exec -T backend php artisan …` (`make:model Product -mf`, `make:migration …`, `migrate:fresh --seed`) |
| Fix PHP style | `docker compose exec -T backend ./vendor/bin/pint` |
| TS types from DTOs | `docker compose exec -T backend php artisan typescript:transform` → `frontend/src/api/generated/types.ts` |
| Frontend package | `docker compose exec -T frontend pnpm add …` |
| shadcn component | `docker compose exec -T frontend pnpm dlx shadcn@latest add dialog` |

## Layout
- `backend/app/Data/` DTOs (see `PingData`), `app/Http/Controllers/` controllers behind `routes/api.php`, `app/Models/`, `app/Enums/`, `app/Services/` business logic; routes in `backend/routes/api.php`.
- `frontend/src/routes/` file routes (the router plugin regenerates `routeTree.gen.ts`), `components/ui/` shadcn primitives, `components/shell/` page chrome, `components/common/` shared widgets, `components/forms/` form controls, and `components/catalogue|cart|checkout|orders|admin/` feature components; `api/` client and `queries/`, `lib/` helpers (`formatPrice` takes cents), `styles/theme.css` tokens.
- App: http://localhost:5173 (proxies `/api` to the backend). API: http://localhost:8000. Postgres: localhost:5432, user/password/db `voltcart`.
