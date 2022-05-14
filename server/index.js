const http = require('http')
const PORT = 8080
const { routes } = require('./routes')

http
  .createServer(function (req, res) {
    routes(req, res)
  })
  .listen(PORT)
