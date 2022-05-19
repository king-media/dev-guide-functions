const fs = require('fs')
const path = require('path')
const browserify = require('browserify')
const cwd = process.cwd()

const { gamesRequest, gameStatsRequest } = require('./games-data')

let html, css

function readHtmlAndAssets(reqUrl) {
  const filePath = reqUrl === '/' ? '/lessons.html' : reqUrl

  if (filePath.match('.html$|.css$')) {
    html = fs.readFileSync(cwd + filePath)
    css = fs.readFileSync(cwd + filePath)
  }
}

const htmlRoute = (req, res) => {
  if (req.url === '/' || req.url.match('.html$')) {
    res.writeHeader(200, { 'Content-Type': 'text/html' })
    res.write(html)
    res.end()
  }
}

const cssRoute = (req, res) => {
  if (req.url.match('.css$')) {
    res.writeHeader(200, { 'Content-Type': 'text/css' })
    res.write(css)
    res.end()
  }
}

const jsRoute = (req, res) => {
  if (req.url.match('.js$')) {
      const jsFileName = req.url.split('/').pop()
      const jsPath = path.join(cwd, req.url)
      const jsFileStream = fs.createReadStream(jsPath, 'UTF-8')
      const distPath = `${cwd}/dist/${jsFileName}`

    res.writeHead(200, { 'Content-Type': 'text/javascript' })
    jsFileStream.pipe(res)
  }
}

/* 
"gamesRequest" returns a promise that can resolve ("then") or reject ("catch")

Think: "Make games request then send the results to the client. If there is an error, then catch and handle that error."

*/

const gamesDataRoute = (req, res) => {
  if (req.url.match('/games')) {
    res.removeHeader('Transfer-Encoding')

    gamesRequest()
      .then((gamesRes) => {
        res.writeHeader(gamesRes.statusCode, {
          'Content-Type': 'application/json',
        })

        res.statusCode = gamesRes.statusCode
        res.end(JSON.stringify(gamesRes))
      })
      .catch((err) => {
        console.error(err)
        res.statusCode = err.statusCode
        res.end(JSON.stringify(err))
      })
  }
}

const gameStatsDataRoute = (req, res) => {
  if (req.url.match('/stats')) {
    const urlSetup = `http://${req.headers.host}`
    const gameId = new URL(req.url, urlSetup).searchParams.get('game_id')

    const homeTeamId = new URL(req.url, urlSetup).searchParams.get(
      'home_team_id'
    )

    const visitorTeamId = new URL(req.url, urlSetup).searchParams.get(
      'visitor_team_id'
    )

    res.removeHeader('Transfer-Encoding')

    gameStatsRequest(gameId, homeTeamId, visitorTeamId)
      .then((gameStatsRes) => {
        console.log('game stats response:', gameStatsRes)

        res.writeHeader(gameStatsRes.statusCode, {
          'Content-Type': 'application/json',
        })

        res.statusCode = gameStatsRes.statusCode
        res.end(JSON.stringify(gameStatsRes))
      })
      .catch((err) => {
        console.error(err)
        res.statusCode = err.statusCode
        res.end(JSON.stringify(err))
      })
  }
}

module.exports = {
  routes: (req, res) => {
    readHtmlAndAssets(req.url)
    htmlRoute(req, res)
    cssRoute(req, res)
    jsRoute(req, res)
    gamesDataRoute(req, res)
    gameStatsDataRoute(req, res)
  },
}
