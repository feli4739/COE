# FireBurst — Gestión de personas

Monorepo: `client` (React + Vite + Tailwind) y `server` (Express + PostgreSQL).

**Marca:** el logo oficial se sirve desde [`client/public/branding/fireburst-logo.jpeg`](client/public/branding/fireburst-logo.jpeg) (copia del asset corporativo FireBurst IT).

## Requisitos

- Node.js 20+
- Docker y Docker Compose (para stack con Nginx + túnel opcional)

## Inicializar todo en Docker (recomendado)

Desde la **raíz del repo** (PowerShell):

```powershell
npm run docker:init
```

Con perfil **Cloudflare Tunnel**:

```powershell
npm run docker:init:tunnel
```

Equivale a `docker compose up -d --build`, espera Postgres y aplica `server/sql/schema.sql`, `seed.sql` y usuarios demo (`seed-users.sql`). Si la base ya existe, **no** vuelve a crear tablas (para resetear: `docker compose down -v`).

Comandos operativos equivalentes (camino recomendado y camino directo):

| Escenario | Recomendado | Directo |
|---|---|---|
| Local (sin túnel) | `npm run docker:init` | `docker compose up -d --build` |
| Cloudflare Tunnel | `npm run docker:init:tunnel` | `docker compose --profile tunnel up -d --build` |

En Windows también podés hacer doble clic o desde `cmd`:

```bat
docker-init.bat
```

Con túnel Cloudflare: `docker-init.bat -WithTunnel`

En Git Bash / Linux / macOS: `chmod +x scripts/docker-init.sh` y `./scripts/docker-init.sh` (o `./scripts/docker-init.sh --tunnel`).

## Desarrollo local (sin Docker para API)

```bash
npm install
npm run dev
```

- Frontend: http://localhost:5173 (proxy a la API en las rutas `/auth`, `/people`, `/stats`)
- API: http://localhost:4000

Copiá `server/.env.example` a `server/.env`, levantá Postgres (`docker compose up -d postgres` o solo el servicio postgres del compose completo) y ejecutá:

```bash
npm run db:setup -w server
```

Usuarios demo tras el seed:

- `admin@fireburst.local` / `FireBurst2025!`
- `demo@fireburst.local` / `demo1234`

## Stack Docker (Nginx + API + Postgres + túnel opcional)

**Un solo origen:** el navegador solo habla con la URL pública (HTTPS del túnel o `http://localhost:8080` en prueba local). Nginx sirve el SPA y enruta `/auth`, `/people`, `/stats`, `/health` al API. El cliente usa **rutas relativas** (`fetch("/auth/login")`, etc.): **no hace falta `VITE_API_URL`** cuando todo pasa por el mismo host.

### Todo el tráfico por la URL del túnel Cloudflare

1. Creá el túnel en [Cloudflare Zero Trust](https://one.dash.cloudflare.com/) → **Networks** → **Tunnels** → conector **Docker** y copiá el **token**.
2. En **Public Hostname**, servicio interno: **`http://web:80`** (`web` = nombre del servicio en [`docker-compose.yml`](docker-compose.yml); puerto 80 dentro de la red Docker).
3. Copiá [`.env.example`](.env.example) a `.env` y configurá:
   - `TUNNEL_TOKEN=<token>`
   - `CLIENT_ORIGIN=https://<exactamente-la-URL-HTTPS-del-túnel>` (sin `/` final; debe ser **la misma** que abrís en el navegador, o CORS falla).
   - `JWT_SECRET` seguro.
4. Levantá stack + túnel:

```bash
docker compose --profile tunnel up -d --build
```

5. Abrí solo la URL HTTPS que te da Cloudflare (o tu dominio). Login y API van **por ese mismo origen**; no uses otra URL ni `localhost` para usar la app en Internet.

### Regenerar túnel (nuevo token) sin tocar API/web/postgres

Usá este flujo cuando cambiaste/rotaste el túnel en Cloudflare:

1. En Cloudflare Zero Trust, creá (o regenerá) el conector Docker y copiá el nuevo token.
2. Actualizá `.env` en la raíz:
   - `TUNNEL_TOKEN=<nuevo-token>`
   - `CLIENT_ORIGIN=https://<url-publica-del-tunel>` (exacta, sin `/` final)
3. Recreá **solo** `cloudflared`:

```bash
npm run docker:tunnel:recreate
```

4. Validá:

```bash
docker compose ps cloudflared
npm run docker:logs:tunnel
```

Este flujo evita reiniciar `api`, `web` y `postgres`.

Inicialización de la base (Postgres expuesto en `localhost:5432`):

```powershell
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fireburst_people"
npm run db:setup -w server
```

### Solo prueba local (sin túnel)

- `CLIENT_ORIGIN=http://localhost:8080`
- No definas `TUNNEL_TOKEN` y **no** uses el perfil `tunnel`:

```bash
docker compose up -d --build
```

Abrí **http://localhost:8080**.

### Variables importantes

| Variable        | Uso |
|----------------|-----|
| `CLIENT_ORIGIN` | Debe ser **exactamente** el origen que ve el navegador (`https://…` del túnel o `http://localhost:8080`). |
| `JWT_SECRET`    | Secreto fuerte para JWT. |
| `TUNNEL_TOKEN`  | Token del conector; solo con `docker compose --profile tunnel up`. |

### Troubleshooting rápido

Comandos base:

```bash
docker compose ps
docker compose logs -f
npm run docker:logs:tunnel
docker compose logs -f web
docker compose logs -f api
```

Si el túnel no publica o falla:

1. Verificá `TUNNEL_TOKEN` en `.env`.
2. Recreá solo `cloudflared`:

```bash
npm run docker:tunnel:recreate
```

3. Confirmá que Cloudflare apunta al servicio interno `http://web:80`.

Si hay error de login/CORS:

1. Verificá que `CLIENT_ORIGIN` sea **idéntico** a la URL que abrís en el navegador.
2. Reiniciá `api` después de cambiar `.env`:

```bash
docker compose up -d --force-recreate api
```

Reset completo (incluye borrar base de datos):

```bash
docker compose down -v
npm run docker:init
```

## Build manual (sin Docker Compose completo)

```bash
npm run build
```

API compilada en `server/dist/`; frontend en `client/dist/`.

## QA Automation AI (Playwright + Ollama)

La plataforma QA modular vive en `qa-system/` y se ejecuta desde `qa/run.ts`.

Comandos:

```bash
npm run qa:run
npm run qa:smoke
npm run qa:regression
npm run qa:api
```

Salida de cada corrida: `qa-runs/{runId}/` con `logs.json`, `network.json`, `errors.json`, `screenshots/`, `video.mp4`, `report.json` y `report.html`.

Guía completa: [`qa-system/README.md`](qa-system/README.md)

## Estructura de despliegue

- [`server/Dockerfile`](server/Dockerfile): imagen Node con `dist` del API.
- [`nginx/Dockerfile`](nginx/Dockerfile): build de Vite + Nginx Alpine.
- [`nginx/nginx.conf`](nginx/nginx.conf): SPA + proxy a `api:4000`.
- [`docker-compose.yml`](docker-compose.yml): orquestación; `cloudflared` en perfil `tunnel` (misma red que `web`; el tráfico público entra por HTTPS en Cloudflare y llega a `web:80`).
