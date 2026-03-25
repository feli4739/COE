#!/usr/bin/env bash
# Inicializa Docker: Postgres + API + web (+ túnel opcional) y aplica SQL.
# Uso: desde la raíz del repo: chmod +x scripts/docker-init.sh && ./scripts/docker-init.sh
# Con túnel: ./scripts/docker-init.sh --tunnel

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]] && [[ -f .env.example ]]; then
  cp .env.example .env
  echo "==> Creado .env desde .env.example (revisá JWT_SECRET y CLIENT_ORIGIN)."
fi

if [[ ! -f docker-compose.yml ]]; then
  echo "No se encontró docker-compose.yml. Ejecutá desde la raíz del repo." >&2
  exit 1
fi

WITH_TUNNEL=0
if [[ "${1:-}" == "--tunnel" ]] || [[ "${1:-}" == "-WithTunnel" ]]; then
  WITH_TUNNEL=1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker no está instalado o no está en PATH." >&2
  exit 1
fi

echo "==> FireBurst: construyendo e iniciando contenedores..."
if [[ "$WITH_TUNNEL" -eq 1 ]]; then
  docker compose --profile tunnel up -d --build
else
  docker compose up -d --build
fi

echo "==> Esperando a Postgres..."
for i in $(seq 1 60); do
  if docker compose exec -T postgres pg_isready -U postgres >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

echo "==> Comprobando base de datos..."
HAS_USERS="$(docker compose exec -T postgres psql -U postgres -d fireburst_people -tAc "SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='users'" 2>/dev/null | tr -d '[:space:]' || true)"

if [[ "$HAS_USERS" == "1" ]]; then
  echo "==> La base ya tiene tablas; omitiendo schema/seed (docker compose down -v para resetear)."
else
  echo "==> Aplicando schema y datos (SQL)..."
  docker compose exec -T postgres psql -U postgres -d fireburst_people -v ON_ERROR_STOP=1 < server/sql/schema.sql
  docker compose exec -T postgres psql -U postgres -d fireburst_people -v ON_ERROR_STOP=1 < server/sql/seed.sql
  docker compose exec -T postgres psql -U postgres -d fireburst_people -v ON_ERROR_STOP=1 < server/sql/seed-users.sql
fi

echo ""
echo "Listo."
echo "  - App local:    http://localhost:8080"
echo "  - Credenciales: admin@fireburst.local / FireBurst2025!  |  demo@fireburst.local / demo1234"
if [[ "$WITH_TUNNEL" -eq 1 ]]; then
  echo "  - Túnel: configurá CLIENT_ORIGIN con la URL HTTPS del túnel en .env"
fi
echo ""
echo "Copiá .env.example a .env y ajustá JWT_SECRET y CLIENT_ORIGIN si aún no lo hiciste."
