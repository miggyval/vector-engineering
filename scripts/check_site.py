"""Check generated internal URLs, fragments, and assets under the Pages prefix."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse, unquote
import argparse
import json

parser = argparse.ArgumentParser()
parser.add_argument('--require-all-media', action='store_true')
args = parser.parse_args()
root = Path('site').resolve()
base = '/vector-engineering/'
known_missing = {'media/videos/01-intro/2160p60/FourierTransformDefinition.mp4'}
class Links(HTMLParser):
    def __init__(self, text):
        super().__init__(); self.links=[]; self.ids=set(); self.feed(text)
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs)
        if 'id' in attrs: self.ids.add(attrs['id'])
        for key in ('href','src'):
            if attrs.get(key): self.links.append(attrs[key])
        if tag == 'script' and attrs.get('src','').startswith('http'): return

pages={p:Links(p.read_text()) for p in root.rglob('*.html')}
failures=[]; missing=set()
for page, data in pages.items():
    rel=page.relative_to(root).as_posix()
    url=base+(rel[:-10] if rel.endswith('index.html') else rel)
    for link in data.links:
        parsed=urlparse(urljoin('https://site.test'+url,link))
        if parsed.scheme not in ('http','https') or parsed.netloc!='site.test': continue
        if not parsed.path.startswith(base):
            failures.append(f'{rel}: URL escapes Pages prefix: {link}');continue
        target=unquote(parsed.path[len(base):])
        dest=(root/target)
        if dest.is_dir(): dest=dest/'index.html'
        if not dest.exists():
            if target in known_missing and rel.startswith('c0-test/') and not args.require_all_media:
                missing.add(target);continue
            failures.append(f'{rel}: missing {link}');continue
        if parsed.fragment and dest in pages and unquote(parsed.fragment) not in pages[dest].ids:
            failures.append(f'{rel}: missing fragment {link}')
for item in sorted(missing): print('Known missing fixture media: '+item)
for item in failures: print(item)
# Fixtures must stay out of search, including subsection documents.
search=json.loads((root/'search/search_index.json').read_text())
for doc in search['docs']:
    if any(doc['location'].startswith(path) for path in ['developer/','c0-test/m1-test/overview/','c0-test/m1-test/theory/','c0-test/m1-test/quiz/']):
        failures.append('Developer fixture leaked into search: '+doc['location'])
print(f'Checked {len(pages)} HTML pages; {len(failures)} failures.')
raise SystemExit(bool(failures))
