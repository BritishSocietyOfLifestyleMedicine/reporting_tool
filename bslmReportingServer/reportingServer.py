from http.server import SimpleHTTPRequestHandler, HTTPServer

class ExtendedServerHandler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if(self.path == '/storedata'):
            content_length = int(self.headers['Content-Length'])
            body = self.rfile.read(content_length).decode('utf-8')
            self.send_response(200)
            self.end_headers()
            with open("bslmReportingServer/data/reporting_data.store", "w", encoding="utf-8") as outfile:
                outfile.write(body)


    def do_GET(self):
        print(self.path)
        if self.path == '/reporting_data.store' or self.path == '/creds.store':
            self.path = 'bslmReportingServer/data' + self.path
        elif self.path == '/favicon.ico':
            self.path = 'bslmReportingServer/app/assets' + self.path
        else:
            self.path = 'bslmReportingServer/app/' + self.path
        return SimpleHTTPRequestHandler.do_GET(self)

def run(server_class=HTTPServer, handler_class=SimpleHTTPRequestHandler):
    server_address = ('', 8000)
    httpd = server_class(server_address, handler_class)
    httpd.serve_forever()


run(server_class=HTTPServer, handler_class=ExtendedServerHandler)

