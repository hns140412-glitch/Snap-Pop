#!/usr/bin/env python3
"""CI-only HTTPS localhost file server. No public bind, no production endpoint."""
import http.server
import pathlib
import ssl
import sys
ROOT = pathlib.Path(__file__).resolve().parents[2]

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

server = http.server.ThreadingHTTPServer(("127.0.0.1", 4174), Handler)
tls = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
tls.load_cert_chain(sys.argv[1], sys.argv[2])
server.socket = tls.wrap_socket(server.socket, server_side=True)
server.serve_forever()
