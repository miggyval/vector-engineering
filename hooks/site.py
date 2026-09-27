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
            cards.append(f'<a class="ve-course-card" href="{escape(url)}"><strong>{escape(title)}</strong><span>View modules →</span></a>')
        markdown += '\n<div class="ve-course-grid">' + ''.join(cards) + '</div>\n'
    for title, folder in COURSES.items():
        if path != folder + '/index.md':
            continue
        section = next(item[title] for item in config.nav if title in item)
        for item in section[1:]:
            for name, children in item.items():
                url = get_relative_url(files.get_file_from_path(first_path(children)).url, page.url)
                markdown += f'\n- [{name}]({url})\n'
    return markdown
