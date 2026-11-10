# Voltcart

An online electronics store. Customers browse the catalogue, keep a wish list and a cart, check out with a delivery method and follow their orders. Admins manage products and stock and get a dashboard overview.

## Stack

- **Backend:** Laravel 13
- **Frontend:** React 19
- **Database:** PostgreSQL 17
- **Tooling:** Docker Compose, Git

Everything runs in Docker, so Docker is the only thing you need to install.

## Setup

```bash
cp backend/.env.example backend/.env
docker compose up -d
docker compose exec -T backend composer install
docker compose exec -T backend php artisan key:generate
docker compose exec -T backend php artisan migrate:fresh --seed
```

| Service  | URL                                      |
|----------|------------------------------------------|
| App      | http://localhost:5173                    |
| API      | http://localhost:8000                    |
| Postgres | localhost:5432 (`voltcart` / `voltcart`) |

### Test accounts

Both accounts use the password `password`.

| Role     | Name         | Email                 |
|----------|--------------|-----------------------|
| Customer | Maya Keller  | `maya@voltcart.test`  |
| Admin    | Daniel Roth  | `admin@voltcart.test` |

## Development

```bash
docker compose exec -T backend ./vendor/bin/pint                 
docker compose exec -T backend php artisan typescript:transform  
docker compose exec -T frontend pnpm add <package>              
```

To work inside the containers open `backend/` or `frontend/` in VS Code and run **Dev Containers: Reopen in Container**.
