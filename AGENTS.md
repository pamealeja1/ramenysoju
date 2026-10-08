# Base44 Setup Notes

## Project Type
Static HTML/CSS/JS anime template site (Colorlib template). No backend, no database, no build step.

## How It Runs
Served by `nginx:alpine` via `docker-compose.base44.yml`. The repo root is bind-mounted read-only into nginx's html directory. Port 3000 maps to nginx port 80.

## Setup Quirk
The repo root directory had restrictive `drwx------` permissions that caused nginx 403 errors. Run `chmod 755 .` if this recurs after a fresh clone.

## Verification
- `curl http://localhost:3000/` returns 200 with the anime template HTML.
- All pages (index, login, signup, blog, categories) and assets (CSS, JS) serve correctly.
