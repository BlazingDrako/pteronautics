#!/usr/bin/env python3
"""Serve the Pteronautics site locally, laid out the way GitHub Pages serves it:

    http://localhost:8780/pteronautics/          this site
    http://localhost:8780/pteronautics-atlas/    Atlas  (clone it beside this folder)
    http://localhost:8780/pteronautics-works/    Works  (clone it beside this folder)
    http://localhost:8780/pteronautics-loom/     Loom   (clone it beside this folder)

The site loads its live figures from ../pteronautics-atlas/, ../pteronautics-works/ and ../pteronautics-loom/. Only these four folders
are served, and only to this computer (127.0.0.1). Usage: python3 serve.py [port] [--no-browser]
"""
import http.server, os, posixpath, sys, urllib.parse, webbrowser

args = [a for a in sys.argv[1:] if not a.startswith("--")]
PORT = int(args[0]) if args else 8780
HERE = os.path.dirname(os.path.abspath(__file__))
PARENT = os.path.dirname(HERE)
def beside(*names):
    """The first of these folders that exists beside this one (clones are named pteronautics-*, or Atlas, Works, Loom)."""
    for n in names:
        if os.path.isdir(os.path.join(PARENT, n)):
            return os.path.join(PARENT, n)
    return os.path.join(PARENT, names[0])


SITES = {"pteronautics": HERE, "pteronautics-atlas": beside("pteronautics-atlas", "Atlas"),
         "pteronautics-works": beside("pteronautics-works", "Works"), "pteronautics-loom": beside("pteronautics-loom", "Loom")}

for name, path in SITES.items():
    if not os.path.isdir(path):
        print(f"note: {name} is not cloned beside this folder; its live figures will show their fallbacks")


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map, ".js": "text/javascript", ".mjs": "text/javascript"}

    def translate_path(self, path):
        # /<site>/<rest> -> that site's folder; anything else -> a path that does not exist (404)
        parts = [p for p in posixpath.normpath(urllib.parse.unquote(urllib.parse.urlsplit(path).path)).split("/") if p and p not in (".", "..")]
        if not parts or parts[0] not in SITES:
            return os.path.join(HERE, "__not_served__")
        return os.path.join(SITES[parts[0]], *parts[1:])

    def do_GET(self):
        if self.path in ("", "/"):
            self.send_response(302); self.send_header("Location", "/pteronautics/"); self.end_headers(); return
        super().do_GET()

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()


class Server(http.server.ThreadingHTTPServer):
    daemon_threads = True
    request_queue_size = 128


if __name__ == "__main__":
    url = f"http://localhost:{PORT}/pteronautics/"
    print(f"Pteronautics at {url}")
    if "--no-browser" not in sys.argv:
        webbrowser.open(url)
    Server(("127.0.0.1", PORT), Handler).serve_forever()
