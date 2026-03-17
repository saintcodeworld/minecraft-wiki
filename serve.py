#!/usr/bin/env python3

from http.server import HTTPServer, BaseHTTPRequestHandler
import os

ST_PATRICK_FILE = "St Patrick Day Event – Minecraft Wiki (2).html"
MAIN_FILE       = "Minecraft Wiki.html"
MOUNTS_FILE     = "Mounts_of_Mayhem.html"

LOCAL_ROUTES = {
    "/w/saint_peter",
    "/w/Saint_Peter",
    "/w/saint_patrick",
    "/w/Saint_Patrick",
    "/w/Saint_patrick",
    "/w/St_Patrick_Day",
    "/w/St_Patrick_Day_Event",
}

MOUNTS_ROUTES = {
    "/w/Mounts_of_Mayhem",
    "/w/mounts_of_mayhem",
}

class WikiHandler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        print(f"  {self.address_string()} - {fmt % args}")

    def do_GET(self):
        path = self.path.split('?')[0]

        if path in ('/', '/index.html'):
            self.serve_file(MAIN_FILE)
            return

        if path in LOCAL_ROUTES:
            self.serve_file(ST_PATRICK_FILE, inject_vote=True)
            return

        if path in MOUNTS_ROUTES:
            self.serve_file(MOUNTS_FILE)
            return

        if path == '/vote.js':
            self.serve_file('vote.js', content_type='application/javascript')
            return

        if path == '/saint%20patrick.jpg' or path == '/saint patrick.jpg':
            self.serve_file('saint patrick.jpg', content_type='image/jpeg')
            return

        self.send_error(404)

    def serve_file(self, filename, content_type='text/html; charset=utf-8', inject_vote=False):
        filepath = os.path.join(os.path.dirname(os.path.abspath(__file__)), filename)
        try:
            with open(filepath, 'rb') as f:
                content = f.read()
            if inject_vote:
                content = content.replace(b'</body>', b'<script src="/vote.js"></script></body>')
            self.send_response(200)
            self.send_header('Content-Type', content_type)
            self.send_header('Cache-Control', 'no-store')
            self.send_header('Content-Length', str(len(content)))
            self.end_headers()
            self.wfile.write(content)
        except FileNotFoundError:
            self.send_error(404, f"File not found: {filename}")

def run(port=3000):
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    httpd = HTTPServer(('', port), WikiHandler)
    print(f"\nWikiLARP Server running at http://localhost:{port}/")
    print(f"  /                  → {MAIN_FILE}")
    print(f"  /w/saint_peter     → {ST_PATRICK_FILE}")
    print(f"  /vote.js           → vote.js")
    print("\nPress Ctrl+C to stop\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down...")
        httpd.shutdown()

if __name__ == '__main__':
    run()
