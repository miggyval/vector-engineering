# Website improvement verification

Verified locally on 28 September 2026:

- `mkdocs build --strict`: passed.
- `python scripts/check_site.py`: 44 HTML pages, zero unexpected broken local
  links, fragments, or assets; developer fixtures excluded from search.
- `python -m pytest tests -q`: 23 passed. Covers catalogue generation, API
  validation, SVG/PNG responses, cache bounds, execution timeout, capacity limits,
  CORS, logging, and removal of server-side Python execution.
- `npm test`: 18 passed in Chromium. Accessibility/layout checks exercise Home,
  a lesson, a quiz, Practice, Python, and the plotter at widths 360, 768, and 1440
  in light and dark themes. Interaction checks cover keyboard input, persistence,
  legacy migration, completion/invalidation, blocked storage, import validation,
  calendar streaks, unavailable APIs, retries, timeouts, and stale responses.
- Browser tests serve the built site beneath `/vector-engineering/`.
- Home screenshots inspected at mobile and desktop sizes.

Python worker lifecycle tests use a controlled Worker substitute to verify Stop,
reset, and both deadlines without downloading the runtime. Actual Pyodide runtime
availability still depends on its external CDN. External font requests are
blocked in browser tests so those checks are deterministic.

One known missing video remains on a hidden developer fixture; see
[MEDIA_AUDIT.md](MEDIA_AUDIT.md). The audit reports it explicitly. Required course
plots and circuit SVGs were restored from existing sources and are tracked.

The API is optional and unset in the static build. Configure `VE_API_BASE_URL`
and host the API separately to enable edge and plotting demos. Deployment is
not performed by this work.

Review history: navigation/presentation and progress were saved as separate
commits. The API/checks/media work was captured by the workspace's audit commit;
final frontend refinements and this verification record follow separately.
