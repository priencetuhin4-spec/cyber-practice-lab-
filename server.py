import http.server
import socketserver
import os
import mimetypes
import re

PORT = 3000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WEB_DIR = os.path.join(BASE_DIR, "web")
APK_PATH = os.path.join(BASE_DIR, "web/Cyber_Practice_Lab.apk")
if not os.path.exists(APK_PATH):
    APK_PATH = os.path.join(BASE_DIR, "app/build/outputs/apk/debug/app-debug.apk")

mimetypes.add_type("image/svg+xml", ".svg")
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("text/css", ".css")
mimetypes.add_type("application/json", ".json")
mimetypes.add_type("application/vnd.android.package-archive", ".apk")

class CyberLabHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WEB_DIR, **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        super().end_headers()

    def do_HEAD(self):
        path = self.path.split("?")[0]
        if path in ("/Cyber_Practice_Lab.apk", "/app.apk", "/cpl.apk", "/app-debug.apk") or (path == "/download" and "direct=1" in self.path):
            if os.path.exists(APK_PATH):
                size = os.path.getsize(APK_PATH)
                self.send_response(200)
                self.send_header("Content-Type", "application/vnd.android.package-archive")
                self.send_header("Content-Disposition", 'attachment; filename="Cyber_Practice_Lab.apk"')
                self.send_header("Content-Length", str(size))
                self.send_header("Accept-Ranges", "bytes")
                self.end_headers()
                return
        super().do_HEAD()

    def do_GET(self):
        raw_path = self.path
        path = raw_path.split("?")[0]

        # Dedicated Download Page
        if path in ("/download", "/apk", "/dl") and "direct=1" not in raw_path:
            download_html_path = os.path.join(WEB_DIR, "download.html")
            if os.path.exists(download_html_path):
                with open(download_html_path, "rb") as f:
                    body = f.read()
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
                return

        # Direct APK Binary Stream (Supports Range requests for Android DownloadManager)
        if path in ("/Cyber_Practice_Lab.apk", "/app.apk", "/cpl.apk", "/app-debug.apk") or (path in ("/download", "/apk", "/dl") and "direct=1" in raw_path):
            if not os.path.exists(APK_PATH):
                self.send_error(404, "APK not found on server")
                return

            file_size = os.path.getsize(APK_PATH)
            range_header = self.headers.get("Range")

            if range_header:
                match = re.search(r"bytes=(\d+)-(\d*)", range_header)
                if match:
                    start = int(match.group(1))
                    end = int(match.group(2)) if match.group(2) else file_size - 1
                    if start >= file_size:
                        self.send_response(416)
                        self.send_header("Content-Range", f"bytes */{file_size}")
                        self.end_headers()
                        return

                    length = end - start + 1
                    self.send_response(206)
                    self.send_header("Content-Type", "application/vnd.android.package-archive")
                    self.send_header("Content-Disposition", 'attachment; filename="Cyber_Practice_Lab.apk"')
                    self.send_header("Content-Range", f"bytes {start}-{end}/{file_size}")
                    self.send_header("Content-Length", str(length))
                    self.send_header("Accept-Ranges", "bytes")
                    self.end_headers()

                    with open(APK_PATH, "rb") as f:
                        f.seek(start)
                        remaining = length
                        while remaining > 0:
                            chunk_size = min(65536, remaining)
                            chunk = f.read(chunk_size)
                            if not chunk:
                                break
                            try:
                                self.wfile.write(chunk)
                                remaining -= len(chunk)
                            except (BrokenPipeError, ConnectionResetError):
                                break
                    return

            # Full file HTTP 200
            self.send_response(200)
            self.send_header("Content-Type", "application/vnd.android.package-archive")
            self.send_header("Content-Disposition", 'attachment; filename="Cyber_Practice_Lab.apk"')
            self.send_header("Content-Length", str(file_size))
            self.send_header("Accept-Ranges", "bytes")
            self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
            self.end_headers()

            with open(APK_PATH, "rb") as f:
                while chunk := f.read(65536):
                    try:
                        self.wfile.write(chunk)
                    except (BrokenPipeError, ConnectionResetError):
                        break
            return

        super().do_GET()

if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("0.0.0.0", PORT), CyberLabHandler) as httpd:
        print(f"Cyber Practice Lab Server running on port {PORT}")
        httpd.serve_forever()
