const http = require('http')
const fs = require('fs')
const path = require('path')

const cwd = process.cwd()

const PORT = 8080

let html, css

fs.readFile(cwd + '/lessons.html', function (err, file) {
  if (err) throw err
  html = file
})

fs.readFile(cwd + '/lessons.css', function (err, file) {
  if (err) throw err
  css = file
})

http
  .createServer(function (req, res) {
    if (req.url === '/') {
      res.writeHeader(200, { 'Content-Type': 'text/html' })
      res.write(html)
      res.end()
    }

    if (req.url.match('.css$')) {
      res.writeHeader(200, { 'Content-Type': 'text/css' })
      res.write(css)
      res.end()
    }

    if (req.url.match('.js$')) {
      const jsPath = path.join(cwd, req.url)
      const fileStream = fs.createReadStream(jsPath, 'UTF-8')
      res.writeHead(200, { 'Content-Type': 'text/javascript' })
      fileStream.pipe(res)
    }
  })
  .listen(PORT)
