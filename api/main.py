"""Optional rendering API. No server-side student code execution."""
import json
import logging
import math
import multiprocessing
import os
import threading
import time
from collections import OrderedDict
from typing import Literal

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from .rendering import render_worker, validate_expr

app = FastAPI()
origins = [s.strip() for s in os.getenv('ALLOWED_ORIGINS', 'http://127.0.0.1:8000,http://localhost:8000').split(',') if s.strip()]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=['GET'], allow_headers=[])
logger = logging.getLogger('vector.api')
_mp = multiprocessing.get_context('spawn')
_slots = threading.BoundedSemaphore(2)
_cache = OrderedDict()
_cache_lock = threading.Lock()
RENDER_TIMEOUT_S = 5.0
CACHE_MAX_ENTRIES = 64
CACHE_MAX_BYTES = 16 * 1024 * 1024
CACHE_TTL_S = 300

@app.middleware('http')
async def request_log(request, call_next):
    start = time.monotonic()
    status = 500
    try:
        response = await call_next(request)
        status = response.status_code
        return response
    finally:
        logger.info(json.dumps({'path': request.url.path, 'method': request.method, 'status': status,
                                'duration_ms': round((time.monotonic()-start)*1000, 2)}))

@app.get('/api/health')
def health():
    return {'status': 'ok'}


def _render(kind, params):
    key = (kind, tuple(sorted(params.items())))
    mime = 'image/png' if kind == 'edge' else 'image/svg+xml'
    with _cache_lock:
        cached = _cache.get(key)
        if cached and cached[0] > time.monotonic():
            _cache.move_to_end(key)
            return Response(cached[1], media_type=mime, headers={'Cache-Control':'public, max-age=300'})
        _cache.pop(key, None)
    if not _slots.acquire(blocking=False):
        raise HTTPException(503, 'Rendering is busy. Please retry.', headers={'Retry-After':'1'})
    receive, send = _mp.Pipe(duplex=False)
    process = _mp.Process(target=render_worker, args=(send,kind,params), daemon=True)
    started = False
    try:
        process.start()
        started = True
        send.close()
        if not receive.poll(RENDER_TIMEOUT_S):
            raise HTTPException(504, 'Rendering timed out. Simplify the expression and retry.')
        try:
            status, payload = receive.recv()
        except EOFError:
            raise HTTPException(503, 'Rendering worker failed')
        if status != 200:
            raise HTTPException(status, payload)
        if len(payload) <= CACHE_MAX_BYTES:
            with _cache_lock:
                _cache[key] = (time.monotonic()+CACHE_TTL_S,payload)
                while len(_cache) > CACHE_MAX_ENTRIES or sum(len(v[1]) for v in _cache.values()) > CACHE_MAX_BYTES:
                    _cache.popitem(last=False)
        return Response(payload, media_type=mime, headers={'Cache-Control':'public, max-age=300'})
    finally:
        send.close(); receive.close()
        if started:
            if process.is_alive(): process.terminate()
            process.join(timeout=1)
            if process.is_alive(): process.kill(); process.join()
            process.close()
        _slots.release()


def _plot(kind, expr, t_min, t_max, n, theme):
    if not math.isfinite(t_min) or not math.isfinite(t_max) or not -1e6 <= t_min < t_max <= 1e6:
        raise HTTPException(422, 'Domain must be finite, increasing, and within ±1,000,000')
    try:
        validate_expr(expr)
    except ValueError as exc:
        raise HTTPException(422, str(exc))
    return _render(kind, dict(expr=expr,t_min=t_min,t_max=t_max,n=n,theme=theme))

@app.get('/api/plot-func')
def plot_func(expr: str = Query('sin(t)',min_length=1,max_length=512),
              t_min: float = -10, t_max: float = 10,
              n: int = Query(400,ge=10,le=5000), theme: Literal['default','slate'] = 'default'):
    return _plot('time',expr,t_min,t_max,n,theme)

@app.get('/api/plot-fourier')
def plot_fourier(expr: str = Query('sin(t)',min_length=1,max_length=512),
                 t_min: float = -10, t_max: float = 10,
                 n: int = Query(400,ge=10,le=5000), theme: Literal['default','slate'] = 'default'):
    return _plot('fourier',expr,t_min,t_max,n,theme)

@app.get('/api/edge-demo')
def edge_demo(t1: int = Query(50,ge=0,le=255), t2: int = Query(150,ge=0,le=255)):
    return _render('edge',dict(t1=t1,t2=t2))
