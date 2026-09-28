import importlib.util
from pathlib import Path
import pytest
from mkdocs.config import load_config
from mkdocs.structure.files import get_files

spec=importlib.util.spec_from_file_location('site_hook',Path('hooks/site.py'))
hook=importlib.util.module_from_spec(spec);spec.loader.exec_module(hook)

def test_catalogue_is_nav_ordered_and_unique():
    config=load_config('mkdocs.yml')
    files=get_files(config);hook.on_files(files,config)
    pages=hook._catalogue
    assert len({p['id'] for p in pages})==len(pages)
    lessons=[p for p in pages if p['kind']=='lesson' and p['course']]
    assert lessons[0]['url'].endswith('01-what-is-a-signal/00-intro/')
    assert all(not p['url'].startswith('c0-test/') for p in lessons)
    assert all('overview' not in p['url'] for p in lessons)
    questions=[q['id'] for p in pages for q in p['questions']]
    assert len(questions)==len(set(questions))

def test_api_config_rejects_invalid_origin(monkeypatch):
    config=load_config('mkdocs.yml')
    class Page:
        meta={'ve_id':'test'}
        url=''
    monkeypatch.setenv('VE_API_BASE_URL','javascript:alert(1)')
    with pytest.raises(ValueError):hook.on_page_content('',Page(),config,None)
