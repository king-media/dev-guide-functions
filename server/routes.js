const fs = require('fs')
const path = require('path')
const cwd = process.cwd()

const { gamesRequest, gameStatsRequest } = require('./games-data')

const htmlRoute = (req, res) => {
  const reqUrl = req.url
  const filePath = reqUrl === '/' ? '/lessons.html' : reqUrl
  const html = fs.readFileSync(cwd + filePath)

  res.writeHeader(200, { 'Content-Type': 'text/html' })
  res.write(html)
  res.end()
}

const cssRoute = (req, res) => {
  const css = fs.readFileSync(cwd + req.url)

  res.writeHeader(200, { 'Content-Type': 'text/css' })
  res.write(css)
  res.end()
}

const jsRoute = (req, res) => {
  const jsFileName = req.url.split('/').pop()
  const jsPath = path.join(cwd, req.url)
  const jsFileStream = fs.createReadStream(jsPath, 'UTF-8')
  const distPath = `${cwd}/dist/${jsFileName}`

  res.writeHead(200, { 'Content-Type': 'text/javascript' })
  jsFileStream.pipe(res)
}

/* 
"gamesRequest" returns a promise that can resolve ("then") or reject ("catch")

Think: "Make games request then send the results to the client. If there is an error, then catch and handle that error."

*/

const gamesDataRoute = (req, res) => {
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
    const reqUrl = req.url
    // keyPair<matchStr, routeHandler>
    const routeHandlers = {
      '/(?!.)|.html$': htmlRoute,
      '.css$': cssRoute,
      '.js$': jsRoute,
      '/games': gamesDataRoute,
      '/stats': gameStatsDataRoute,
    }

    const route = Object.keys(routeHandlers).find((matchStr) =>
      reqUrl.match(matchStr)
    )

    if (route) {
      routeHandlers[route](req, res)
    } else {
      res.statusCode = '400'
      res.end(JSON.stringify({ statusCode: '400', message: 'Bad Request' }))
    }
  },
}
