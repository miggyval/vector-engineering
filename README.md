# Vector Engineering

Engineering course notes built with MkDocs Material. Lesson content is authored
in Markdown. Quizzes and progress run locally; Python practice runs in a browser
worker. FastAPI is optional and only renders plots and edge-detection images.

## Setup (Python 3.12 and Node 22)

```sh
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
npm ci
npx playwright install chromium
```

`requirements.txt` pins the tested Python environment; `package-lock.json` locks
browser checks. Media outputs needed for publication are tracked, so a normal
site build does not require TeX, FFmpeg, or Manim.

## Static site

```sh
mkdocs serve --dev-addr 127.0.0.1:8000
mkdocs build --strict
python scripts/check_site.py
```

An unset `VE_API_BASE_URL` disables server-backed demo requests and shows an
unavailable state. Lessons, quizzes, progress, and browser Python still work.
Python's first run requires access to the Pyodide CDN. Progress stays on the
current device; Home provides JSON export/import and reset controls.

For a production-prefix preview after building:

```sh
python scripts/serve_preview.py
# Open http://127.0.0.1:8765/vector-engineering/
```

## Optional API

Run in a separate terminal:

```sh
source .venv/bin/activate
uvicorn api.main:app --host 127.0.0.1 --port 8001 --log-level info
```

Start the site with the API address embedded at build time:

```sh
VE_API_BASE_URL=http://127.0.0.1:8001 mkdocs serve --dev-addr 127.0.0.1:8000
```

For deployment, host the API on a separately managed HTTPS service. Install the
pinned requirements and launch Uvicorn on the port assigned by that service.
Terminate TLS at the hosting proxy; set `ALLOWED_ORIGINS` to the exact website
origin (`https://miggyval.github.io`, without `/vector-engineering/`). Multiple
origins are comma-separated. Configure the proxy with a request-size limit and
an appropriate public rate limit. Keep one API process for a total of two active
render jobs; each extra Uvicorn worker has its own two-job limit and cache.

Build GitHub Pages with `VE_API_BASE_URL=https://YOUR_API_HOST` and upload `site/`
using your Pages deployment workflow, or run `mkdocs gh-deploy` when publishing
is intended. These changes add checks, not automatic publication.

API behaviour:

- `GET /api/health`: liveness.
- `GET /api/plot-func` and `/api/plot-fourier`: SVG responses; invalid inputs are
  HTTP 422 JSON `{ "detail": ... }`, rather than empty plots.
- `GET /api/edge-demo`: PNG response.
- Render jobs have a five-second subprocess deadline. Capacity exhaustion returns
  503 with `Retry-After`; timeout returns 504. Results use a five-minute cache,
  capped at 64 entries and 16 MiB per API process.
- **Removed:** `POST /api/python-repl`. Student code is never executed by the API.

Request logs contain method, path, status, and elapsed time, without query strings
or student code. To enable the application logger, configure the `vector.api`
logger at INFO in your hosting logging configuration. Monitor 503/504 rates and
request durations alongside your host's process/memory metrics.

## Checks

```sh
mkdocs build --strict
python scripts/check_site.py
python -m pytest tests -q
npm test
```

Browser checks use a production subpath and cover layouts, both themes, keyboard
quizzes, migration, blocked storage, import validation, and demo failures.
CI runs the same checks on pushes and pull requests.

See [AUTHORING.md](AUTHORING.md) for component examples and stable progress IDs.
See [MEDIA_AUDIT.md](MEDIA_AUDIT.md) for restored assets and the missing developer
fixture video. `python scripts/check_site.py --require-all-media` makes that
known missing video a blocking check as well.
