"""Serve site/ under the same URL prefix as GitHub Pages."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--port',type=int,default=8765)
args = parser.parse_args()
class Handler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass
    def translate_path(self,path):
        prefix='/vector-engineering/'
        if path.startswith(prefix): path=path[len('/vector-engineering'):]
        return super().translate_path(path)
    def __init__(self,*a,**kw):
        super().__init__(*a,directory=str(Path('site').resolve()),**kw)
ThreadingHTTPServer(('127.0.0.1',args.port),Handler).serve_forever()
