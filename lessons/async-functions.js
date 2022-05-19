const localURL = 'http://localhost:8080'
const today = new Date().toISOString().split('T')[0]
const gameContainer = document.querySelector('.game-container')
const loadingSpinner = document.querySelector('.load-wrapp')
const refreshBtn = document.querySelector('#refreshBtn')

let games = []

/*
 Async/Await:
 
 - Defined w/ an async signature. This allows for more readable async code.
 - Utilizes Async/Await syntax that allows you to "await" for a Promise to resolve or reject.
 - Async function always returns a promise.
 - MUST use a Try/Catch block for correct error handling.
*/

// Make API call and receive data
const getGames = async () => {
  let gamesState = sessionStorage.getItem('games')

  if (gamesState) {
    games = JSON.parse(gamesState)
    loadingSpinner.style.display = 'none'
    return { success: true, error: null }
  }

  try {
    const gamesFetchResponse = await fetch(`${localURL}/games`)
    gamesState = await gamesFetchResponse.json()

    games = gamesState.data
    loadingSpinner.style.display = 'none'

    sessionStorage.setItem('games', JSON.stringify(gamesState.data))

    return { success: true, error: null }
  } catch (err) {
    console.error(err)
    return { success: false, error: err }
  }
}

const toggleGameStats = async (gameId, homeTeamId, visitorTeamId) => {
  const gameState = JSON.parse(sessionStorage.getItem('games'))
  const gameStats = gameState.find((game) => game.id === gameId).home_team.stats

  if (gameState && !gameStats) {
    try {
      let gameStats = await fetch(
        `${localURL}/stats?game_id=${gameId}&home_team_id=${homeTeamId}&visitor_team_id=${visitorTeamId}`
      )

      render('spinner', { gameId })

      gameStats = await gameStats.json()

      const gameWithStats = games.find((game) => game.id === gameId)

      gameWithStats.home_team.stats = gameStats.data.home_team.stats
      gameWithStats.home_team.leadingStats =
        gameStats.data.home_team.leadingStats

      gameWithStats.visitor_team.stats = gameStats.data.visitor_team.stats
      gameWithStats.visitor_team.leadingStats =
        gameStats.data.visitor_team.leadingStats
    } catch (err) {}
  }
  // call update method here...
  updateAndRender(gameId)
}

const returnTeamStats = (teamInfo) => {
  const statsComp = teamInfo.stats.map((playerStats) => {
    const cloneStats = { ...playerStats }
    const fullName = `${cloneStats.player.first_name} ${cloneStats.player.last_name}`
    const { position } = cloneStats.player

    // Remove props we don't want displayed w/o mutating data.
    delete cloneStats.id
    delete cloneStats.gameId
    delete cloneStats.teamId
    delete cloneStats.player
    delete cloneStats.team
    delete cloneStats.game

    const statRow = Object.keys(cloneStats).map(
      (key) => `<span class="pa-1">${cloneStats[key]} ${key}</span>`
    )

    return `
      <div class="flex-row pa-2">
        <span class=player-info>${fullName} | ${position}</span>
        <div class="stats-row">
          ${statRow.join('')}
        </div>
      </div>
    `
  })

  return statsComp.join('')
}

// Render list of games w/ retrieved data
function spinnerTemplate(id) {
  return `
        <div class="load-wrapp" id="${id}">
          <div class="loading-spinner">
            <div class="ring-2">
              <div class="ball-holder">
                <div class="ball"></div>
              </div>
            </div>
          </div>
        </div>`
}

const setGameRow = (homeTeamInfo, visitorTeamInfo, gameInfo) => {
  return `
      <div class="flex-row game-row" id="game-${gameInfo.id}">
        <div class="flex-column">
          <h1>Home</h1>
          <h2 id="team1Name">${homeTeamInfo.fullName}</h2>
        </div>
        <div class="flex-column">
          <span id="date">${gameInfo.date}</span>
          <span id="quarter">${gameInfo.status}</span>
          <div class="flex-row">
            <span id="team1Score">${homeTeamInfo.score}</span>
            <span>-</span>
            <span id="team2Score">${visitorTeamInfo.score}</span>
          </div>
        </div>
        <div class="flex-column">
          <h1>Away</h1>
          <h2 id="team2Name">${visitorTeamInfo.fullName}</h2>
        </div>
      </div>
    `
}

const setStatsRow = (homeTeamInfo, visitorTeamInfo, gameInfo) => {
  return `
    <div class="stats-col" id="stats-${gameInfo.id}">
      <h2>${homeTeamInfo.fullName} Stats</h2>
      <div class="flex-column">
        <h4>Leading Scorer</h4>
        <span id="team1LeadScorer">${
          homeTeamInfo.leadingStats?.player?.full_name
        }</span>
        <div class="flex-row col-gap pa-2" id="team1LeadStats">
          <span>${homeTeamInfo.leadingStats?.points} pts</span>
          <span>${homeTeamInfo.leadingStats?.rebounds} rebs</span>
          <span>${homeTeamInfo.leadingStats?.assist} assist</span>
        </div>
      </div>
      <hr>
      <div class="flex-row pa-0">
        <div class="stats-row">
          ${returnTeamStats(homeTeamInfo)}
        </div>
      </div>
      <h2>${visitorTeamInfo.fullName} Stats</h2>
      <div class="flex-column">
        <h4>Leading Scorer</h4>
        <span id="team2LeadScorer">${
          visitorTeamInfo.leadingStats?.player?.full_name
        }</span>
        <div class="flex-row col-gap pa-2" id="team2LeadStats">
          <span>${visitorTeamInfo.leadingStats?.points} pts</span>
          <span>${visitorTeamInfo.leadingStats?.rebounds} rebs</span>
          <span>${visitorTeamInfo.leadingStats?.assist} assist</span>
        </div>
      </div>
      <hr>
      <div class="flex-row pa-0">
        <div class="stats-row">
          ${returnTeamStats(visitorTeamInfo)}
        </div>
      </div>
    </div>
  `
}

const render = (type, options) => {
  let gameRow

  switch (type) {
    case 'error':
      console.log('will render error message here:', options.error)
      break
    case 'spinner':
      gameRow = document.querySelector(`#game-${options.gameId}`)

      gameRow.insertAdjacentHTML(
        'afterend',
        spinnerTemplate(`stats-spinner-${options.gameId}`)
      )

      break

    case 'stats':
      gameRow = document.querySelector(`#game-${options.gameId}`)
      const spinner = document.querySelector(`#stats-spinner-${options.gameId}`)

      if (options.removeElem) {
        options.removeElem.remove()

        break
      }

      if (spinner) {
        spinner.remove()
      }

      const { home_team, visitor_team, ...game } = games.find(
        (game) => game.id === options.gameId
      )

      gameRow.insertAdjacentHTML(
        'afterend',
        setStatsRow(home_team, visitor_team, game)
      )

      break
    default:
      games.forEach(({ home_team, visitor_team, ...game }) => {
        gameContainer.insertAdjacentHTML(
          'beforeend',
          setGameRow(home_team, visitor_team, game)
        )

        const gameRows = document.querySelectorAll('.game-row')

        gameRows.forEach((gameRow) => {
          if (gameRow.getAttribute('id') === `game-${game.id}`) {
            gameRow.onclick = () =>
              toggleGameStats(game.id, home_team.id, visitor_team.id)
          }
        })
      })
  }
}

const fetchGamesAndRender = async () => {
  // Renders Games i.e. Game1: GamesTemplate, Game2: GamesTemplate etc... Call GamesTemplate.setGameRow and append result
  const { success, error } = await getGames()

  success ? render() : render('error', { error })
}

// save new game state into sessions storage & trigger re-render (clear all game rows & load spinner)
const updateAndRender = (gameId) => {
  const hasRenderedStats = document.querySelector(`#stats-${gameId}`)

  render('stats', { gameId, removeElem: hasRenderedStats })
  sessionStorage.setItem('games', JSON.stringify(games))
}

refreshBtn.onclick = () => {
  sessionStorage.clear()
  loadingSpinner.style.display = 'initial'
  gameContainer.replaceChildren(loadingSpinner, refreshBtn)

  fetchGamesAndRender()
}

fetchGamesAndRender()
