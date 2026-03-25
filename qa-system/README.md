# QA System (AI-powered)

Plataforma QA modular para FireBurst COE con:
- E2E Playwright
- Captura de evidencia (logs/network/screenshots/video)
- Análisis de fallos con Ollama local
- Reportes JSON + HTML

## Estructura

- `qa-system/runner`: escenarios y ejecución Playwright
- `qa-system/collector`: captura de console/network/errors
- `qa-system/ai`: integración Ollama
- `qa-system/reports`: generación de `report.json` y `report.html`
- `qa-system/orchestrator`: pipeline end-to-end
- `qa-system/utils`: config, fs, sanitización, logger
- `qa/run.ts`: entrypoint CLI

## Variables requeridas

Configurar en `.env` (raíz):
- `QA_BASE_URL`
- `QA_EMAIL`
- `QA_PASSWORD`
- `OLLAMA_MODEL` (opcional, default `llama3.1:8b`)
- `OLLAMA_URL` (opcional, default `http://127.0.0.1:11434`)

Opcionales:
- `QA_OUTPUT_DIR` (default `qa-runs`)
- `QA_TAGS` (default `smoke,regression,api`)
- `QA_ENV` (`dev|staging|prod`, default `dev`)
- `QA_HEADLESS` (default `true`)
- `QA_TIMEOUT_MS` (default `25000`)
- `QA_RETRIES` (default `1`)

## Ejecución

- Run completo: `npm run qa:run`
- Solo smoke: `npm run qa:smoke`
- Solo regression: `npm run qa:regression`
- Solo api: `npm run qa:api`

Overrides por CLI:
- `npm run qa:run -- --baseUrl=https://tu-url`
- `npm run qa:run -- --tags=smoke,api`
- `npm run qa:run -- --env=staging`
- `npm run qa:run -- --headed`

## Artifacts generados

Por cada corrida:

`qa-runs/{runId}/`
- `logs.json`
- `network.json`
- `errors.json`
- `screenshots/*.png`
- `video.mp4`
- `report.json`
- `report.html`

## Escalabilidad multi-proyecto

El contrato `ProjectAdapter` en `qa-system/types.ts` permite crear adaptadores por proyecto.
Para soportar otra app:
1. Crear `runner/<otherAdapter>.ts` con `buildScenarios()`.
2. Cambiar el adapter usado por `qa/run.ts`.
3. Reutilizar collector/ai/reports/orchestrator sin cambios.

## CI/CD (ejemplo GitHub Actions)

Pasos recomendados:
1. Levantar app target (docker stack o entorno staging).
2. `npm ci`
3. `npx playwright install chromium`
4. `npm run qa:smoke`
5. Publicar `qa-runs/*` como artifact
6. Fallar pipeline si exit code != 0

## Runs programados (cron)

- Usar scheduler de CI (GitHub Actions cron o equivalente).
- Configurar `QA_BASE_URL` al entorno deseado.
- Mantener retention de artifacts para trazabilidad.

## Seguridad

- Sanitización de datos sensibles:
  - en headers (`authorization`, `cookie`, `token`, `password`)
  - en textos (`Bearer ...`, `password=...`, `token=...`)
- No persistir secretos en reportes.
- Controlar permisos de lectura de `qa-runs/` en ambientes compartidos.
