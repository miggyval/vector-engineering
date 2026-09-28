import time
import pytest
from fastapi.testclient import TestClient
from api import main
from api.rendering import validate_expr

client = TestClient(main.app)

@pytest.mark.parametrize('params', [
    {'expr': '__import__("os")'}, {'expr':'t.real'}, {'expr':'9'*513},
    {'expr':'(' * 25 + 't' + ')' * 25 + '+True'}, {'expr':'1e100'},
    {'t_min':'nan'}, {'t_max':'inf'}, {'t_min':10,'t_max':-10},
    {'theme':'other'}, {'n':5001}, {'expr':'t+'}, {'expr':'+'.join(['t']*100)},
])
def test_invalid_plot(params):
    response = client.get('/api/plot-func',params=params)
    assert response.status_code == 422
    assert 'detail' in response.json()

@pytest.mark.parametrize('endpoint,mime', [('plot-func','image/svg+xml'),('plot-fourier','image/svg+xml'),('edge-demo','image/png')])
def test_renders_and_caches(endpoint,mime,monkeypatch):
    response = client.get('/api/'+endpoint)
    assert response.status_code == 200, response.text[:200]
    assert response.headers['content-type'].startswith(mime)
    class NoProcess:
        def Process(self, **kwargs): raise AssertionError('Cache should avoid a new worker')
    monkeypatch.setattr(main,'_mp',NoProcess())
    assert client.get('/api/'+endpoint).content == response.content


def test_invalid_evaluation():
    assert client.get('/api/plot-func',params={'expr':'sqrt(-1)'}).status_code == 422
    assert client.get('/api/plot-fourier',params={'expr':'log(t)'}).status_code == 422


def test_removed_execution_endpoint():
    assert client.post('/api/python-repl',json={'code':'print(1)'}).status_code == 404


def test_busy():
    main._slots.acquire(); main._slots.acquire()
    try:
        response = client.get('/api/plot-func',params={'expr':'sin(t)+0.123'})
        assert response.status_code == 503
        assert response.headers['retry-after'] == '1'
    finally:
        main._slots.release(); main._slots.release()


def slow_worker(connection,kind,params):
    time.sleep(30)


def test_timeout_releases_slot(monkeypatch):
    monkeypatch.setattr(main,'render_worker',slow_worker)
    monkeypatch.setattr(main,'RENDER_TIMEOUT_S',0.1)
    assert client.get('/api/plot-func',params={'expr':'t+0.789'}).status_code == 504
    assert main._slots.acquire(blocking=False)
    assert main._slots.acquire(blocking=False)
    main._slots.release(); main._slots.release()


def test_cors_and_logging(caplog):
    with caplog.at_level('INFO',logger='vector.api'):
        response = client.get('/api/health',headers={'Origin':'http://localhost:8000'})
    assert response.headers['access-control-allow-origin'] == 'http://localhost:8000'
    assert 'duration_ms' in caplog.text
    response = client.get('/api/health',headers={'Origin':'https://untrusted.example'})
    assert 'access-control-allow-origin' not in response.headers


def test_cache_bound(monkeypatch):
    main._cache.clear()
    monkeypatch.setattr(main,'CACHE_MAX_ENTRIES',1)
    for expr in ['t+11','t+12']:
        assert client.get('/api/plot-func',params={'expr':expr}).status_code == 200
    assert len(main._cache) == 1
