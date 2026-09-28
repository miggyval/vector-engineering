"""Build navigation-derived landing pages; course prose remains author-owned."""
from html import escape
from mkdocs.utils import get_relative_url

COURSES = {'Signals and Systems': 'c1-signals-and-systems', 'Control': 'c2-control', 'Robotics': 'c3-robotics'}

def first_path(value):
    if isinstance(value, str):
        return value
    for item in value:
        for child in item.values():
            return first_path(child)


def on_page_markdown(markdown, page, config, files):
    path = page.file.src_uri
    if path == 'index.md':
        cards = []
        for title, folder in COURSES.items():
            url = get_relative_url(files.get_file_from_path(folder + '/index.md').url, page.url)
            cards.append(f'<a class="ve-course-card" href="{escape(url)}"><strong>{escape(title)}</strong><span>View modules →</span><span data-course-progress="{escape(title)}"></span></a>')
        markdown = markdown.replace('<!-- Course cards are generated from navigation. -->', '<div class="ve-course-grid">' + ''.join(cards) + '</div>')
    for title, folder in COURSES.items():
        if path != folder + '/index.md':
            continue
        section = next(item[title] for item in config.nav if title in item)
        for item in section[1:]:
            for name, children in item.items():
                url = get_relative_url(first_path(children), page.file.src_uri)
                markdown += f'\n- [{name}]({url})\n'
    return markdown

# Catalogue is generated from nav + permanent authoring metadata, never the DOM.
import json
import os
import re
from pathlib import Path
from urllib.parse import urlparse
import yaml

_catalogue = []

def on_files(files, config):
    global _catalogue
    _catalogue = []
    locations = {}
    def visit(items, trail=()):
        for item in items:
            for title, value in item.items():
                if isinstance(value, str):
                    locations[value] = trail + (title,)
                else:
                    visit(value, trail + (title,))
    visit(config.nav)
    seen = set()
    for file in files.documentation_pages():
        source = Path(file.abs_src_path).read_text()
        meta = yaml.safe_load(source.split('---', 2)[1]) if source.startswith('---\n') else {}
        pid = meta.get('ve_id')
        if not pid or pid in seen:
            raise ValueError(f'Missing or duplicate ve_id: {file.src_uri}')
        seen.add(pid)
        trail = locations.get(file.src_uri, ())
        questions = []
        for tag in re.findall(r'<div\b[^>]*\bdata-question-id="[^"]+"[^>]*>', source):
            attrs = dict(re.findall(r'([\w-]+)="([^"]*)"', tag))
            qid = attrs['data-question-id']
            if qid in seen:
                raise ValueError(f'Duplicate question ID: {qid}')
            seen.add(qid)
            questions.append({'id': qid, 'legacyIndex': int(attrs['data-legacy-index'])})
        heading = re.search(r'^#\s+(.+)$', source, re.M)
        _catalogue.append({'id': pid, 'url': file.url, 'title': heading[1] if heading else (trail[-1] if trail else file.src_uri),
                           'kind': meta.get('ve_kind', 'lesson'), 'course': trail[0] if trail else '',
                           'module': trail[1] if len(trail) > 2 else '', 'questions': questions,
                           'legacyPath': meta.get('ve_legacy_path') or file.url, 'order': list(locations).index(file.src_uri) if file.src_uri in locations else 100000})
    _catalogue.sort(key=lambda e: e['order'])
    return files


def on_page_content(html, page, config, files):
    api_url = os.environ.get('VE_API_BASE_URL', '').rstrip('/')
    if api_url:
        parsed = urlparse(api_url)
        if parsed.scheme not in ('http', 'https') or not parsed.netloc or parsed.query or parsed.fragment:
            raise ValueError('VE_API_BASE_URL must be an absolute HTTP(S) URL without query or fragment')
    data = {'pageId': page.meta['ve_id'], 'root': get_relative_url('index.html', page.url),
            'basePath': urlparse(config.site_url).path, 'catalogue': _catalogue, 'apiBaseUrl': api_url}
    return '<script>window.VE_SITE=' + json.dumps(data).replace('<', '\\u003c') + ';</script>\n' + html
