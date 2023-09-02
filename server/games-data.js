/*
  Promises:

  - An API that allows for smarter handling of ASYNC work. It's really an object.
  - Usually used in conjunction w/ base & async functions that RETURN a promise.
  - Promises also utilize callbacks as well.

  Ex: THINK ABOUT THE NAME (PROMISES) - Object: "I promise to give you info when I am done.""
*/

/* 
Make a http request to get the 1st 10 games

- We need to know what the last page is in order to get the last 10 games and display them on the front end. (API has pagination but doesn't fetch games in DESC)

*/

const https = require('https')
const year = new Date().getFullYear()
const failureMessage = 'FAILED: Could not find list of games'

const mapGameData = (data) => {
  return data.map(({ home_team, visitor_team, ...game }) => ({
    home_team: {
      id: home_team.id,
      fullName: home_team.full_name,
      score: game.home_team_score,
      stats: null,
    },
    visitor_team: {
      id: visitor_team.id,
      fullName: visitor_team.full_name,
      score: game.visitor_team_score,
      stats: null,
    },
    id: game.id,
    status: game.status,
    date: new Date(game.date).toDateString(),
  }))
}

const mapPlayerStats = (teamId, playerStats) => {
  let stats = playerStats
    .filter((data) => data.team.id === teamId)
    .map((teamStats) => ({
      ...teamStats,
      gameId: teamStats.game.id,
      teamId: teamStats.team.id,
    }))

  const leadingStats = stats.find(
    (teamStats) =>
      teamStats.pts === Math.max(...stats.map((allStats) => allStats.pts))
  )

  if (leadingStats) {
    return {
      stats,
      leadingStats: {
        player: {
          ...leadingStats.player,
          full_name: `${leadingStats.player.first_name} ${leadingStats.player.last_name}`,
        },
        team: leadingStats.team,
        points: leadingStats.pts,
        assist: leadingStats.ast,
        rebounds: leadingStats.reb,
      },
    }
  }

  return { stats }
}

const mapGameStatsData = (data, homeTeamId, visitorTeamId) => {
  const home_team = mapPlayerStats(homeTeamId, data)
  const visitor_team = mapPlayerStats(visitorTeamId, data)

  return { home_team, visitor_team }
}

/* 
NOTES:

This method grabs the data necessary to fetch the last 10 or so games.
The method returns an async Promise that can either "resolves" (no errors & has data) or "rejects" (errors & does not have data).

PSEUDO - I "metaRequest" promise(toResolve, orToReject) => { ...when code } is done.

Keep the above PSEUDO in mind for the rest of the methods below.
*/

const metaRequest = (season = year) => {
  let responseData = { season }
  let chunkData = []

  return new Promise((resolve, reject) => {
    https
      .get(
        `https://www.balldontlie.io/api/v1/games?seasons[]=${season}&per_page=10`,
        (res) => {
          console.log(`status: ${res.statusCode}`)

          res.on('data', (chunk) => {
            chunkData.push(chunk)
          })

          res.on('end', () => {
            console.log(`finish grabbing game meta data.`)

            const parseChunk = JSON.parse(Buffer.concat(chunkData).toString())

            responseData.last_page = parseChunk?.meta?.total_pages
            responseData.statusCode =
              parseChunk?.data.length > 0 ? res.statusCode : 404
            responseData.message =
              res.statusCode === 200 && parseChunk.data.length !== 0
                ? 'OK'
                : failureMessage

            resolve(responseData)
          })
        }
      )
      .on('error', (error) => {
        console.error(error)
        responseData.statusCode = 500
        responseData.message = 'INTERNAL ERROR: See logs for details.'

        reject(responseData)
      })
  })
}

const gamesRequest = async () => {
  let responseData = {}
  let chunkData = []
  let metadata = await metaRequest()

  // Retry once w/ different year
  if (metadata.statusCode !== 200) {
    metadata = await metaRequest(metadata.season - 1)
  }

  return new Promise((resolve, reject) => {
    https
      .get(
        `https://www.balldontlie.io/api/v1/games?seasons[]=${metadata.season}&page=${metadata.last_page}&per_page=10`,
        (res) => {
          console.log(`status: ${res.statusCode}`)

          res.on('data', (chunk) => {
            chunkData.push(chunk)
          })

          res.on('end', () => {
            console.log(`finish grabbing game data.`)

            const parseChunk = JSON.parse(Buffer.concat(chunkData).toString())

            responseData.data = mapGameData(parseChunk?.data)
            responseData.statusCode =
              parseChunk?.data.length > 0 ? res.statusCode : 404
            responseData.message =
              res.statusCode === 200 && parseChunk.data.length !== 0
                ? 'OK'
                : failureMessage

            resolve(responseData)
          })
        }
      )
      .on('error', (error) => {
        console.error(error)
        responseData.statusCode = 500
        responseData.message = 'INTERNAL ERROR: See logs for details.'

        reject(responseData)
      })
  })
}

const gameStatsRequest = async (gameId, homeTeamId, visitorTeamId) => {
  console.log(`stats called for ${gameId}`)

  let responseData = {}
  let chunkData = []

  return new Promise((resolve, reject) => {
    https
      .get(
        `https://www.balldontlie.io/api/v1/stats?game_ids[]=${gameId}&per_page=50`,
        (res) => {
          console.log(`status: ${res.statusCode}`)

          res.on('data', (chunk) => {
            chunkData.push(chunk)
          })

          res.on('end', () => {
            console.log(`finish grabbing game stats data.`)

            const parseChunk = JSON.parse(Buffer.concat(chunkData).toString())

            responseData.data = mapGameStatsData(
              parseChunk?.data,
              parseInt(homeTeamId),
              parseInt(visitorTeamId)
            )
            responseData.statusCode =
              parseChunk?.data.length > 0 ? res.statusCode : 404
            responseData.message =
              res.statusCode === 200 && parseChunk.data.length !== 0
                ? 'OK'
                : failureMessage

            resolve(responseData)
          })
        }
      )
      .on('error', (error) => {
        console.error(error)
        responseData.statusCode = 500
        responseData.message = 'INTERNAL ERROR: See logs for details.'

        reject(responseData)
      })
  })
}

module.exports = {
  gamesRequest,
  gameStatsRequest,
}
