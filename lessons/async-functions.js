const localURL = 'http://localhost:8080'
const today = new Date().toISOString().split('T')[0]
const gameContainer = document.querySelector('.game-container')
const loadingSpinner = document.querySelector('.load-wrapp')

let games = []
// Implement proxy in order to validate and deep update state & re-render here...
// const handleGameState = () => ({
//    get(obj, prop) {
// 			if (prop === '_isProxy') return true;

//       if (obj[prop] === undefined || obj[prop] === null) return obj[prop]

// 			if (typeof obj[prop] === 'object' && !obj[prop]._isProxy) {
// 				obj[prop] = new Proxy(obj[prop], handleGameState());
// 			}

// 			return obj[prop];
// 		},
// 		set(obj, prop, value) {
// 			if (obj[prop] === value) return true;
			
//       obj[prop] = value;
//       // call debounced version of update method here...
// 			return true;
// 		},
// 		deleteProperty(obj, prop) {
// 			delete obj[prop];
// 			return true;
// 		}
// });

// Component creation


// Make API call and receive data
const getGames = async () => {
  let gamesState = sessionStorage.getItem('games')

  if (gamesState) {
    // games = new Proxy(JSON.parse(gamesState), handleGameState())
    games = JSON.parse(gamesState)
    loadingSpinner.style.display = 'none'
    return { success: true, error: null }
  }

  try {
    const gamesFetchResponse = await fetch(`${localURL}/games`)
    gamesState = await gamesFetchResponse.json()

    // games = new Proxy(gamesState.data, handleGameState())
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
  const gameState = JSON.parse(sessionStorage.getItem("games"))
  const gameStats = gameState.find(game => game.id === gameId).home_team.stats

  if (gameState && !gameStats) {
    try {
      let gameStats = await fetch(
        `${localURL}/stats?game_id=${gameId}&home_team_id=${homeTeamId}&visitor_team_id=${visitorTeamId}`
      )

      render("spinner", { gameId })

      gameStats = await gameStats.json()

      const gameWithStats = games.find(game => game.id === gameId)

      gameWithStats.home_team.stats = gameStats.data.home_team.stats
      gameWithStats.home_team.leadingStats = gameStats.data.home_team.leadingStats

      gameWithStats.visitor_team.stats = gameStats.data.visitor_team.stats
      gameWithStats.visitor_team.leadingStats = gameStats.data.visitor_team.leadingStats
    } catch (err) {}
  }
  // call update method here...
  updateAndRender(gameId)
}


// Render list of games w/ retrieved data

const setGameRow = (homeTeamInfo, visitorTeamInfo, gameInfo) => {
  return `
      <div class="flex-row game-row" id="game-${gameInfo.id}">
        <div class="flex-column">
          <h1>Home</h1>
          <h2 id="team1Name">${homeTeamInfo.fullName}</h2>
        </div>
        <div class="flex-column">
          <span id="date">${gameInfo.date}
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
    <div class="flex-row stats-row" id="stats-${gameInfo.id}">
      <h2>Game Stats</h2>
      <div class="flex-column">
        <h4>Leading Scorer</h4>
        <span id="team1LeadScorer">${homeTeamInfo.leadingStats?.player?.full_name}</span>
        <div class="flex-row col-gap pa-2" id="team1LeadStats">
          <span>${homeTeamInfo.leadingStats?.points} pts</span>
          <span>${homeTeamInfo.leadingStats?.rebounds} rebs</span>
          <span>${homeTeamInfo.leadingStats?.assist} assist</span>
        </div>
      </div>
      <div class="flex-column">
        <h4>Leading Scorer</h4>
        <span id="team2LeadScorer">${visitorTeamInfo.leadingStats?.player?.full_name}</span>
        <div class="flex-row col-gap pa-2" id="team2LeadStats">
          <span>${visitorTeamInfo.leadingStats?.points} pts</span>
          <span>${visitorTeamInfo.leadingStats?.rebounds} rebs</span>
          <span>${visitorTeamInfo.leadingStats?.assist} assist</span>
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
    break;
    case 'spinner':
      gameRow = document.querySelector(`#game-${options.gameId}`)

      gameRow.insertAdjacentHTML('beforeend', `
        <div class="load-wrapp" id="stats-spinner">
          <div class="loading-spinner">
            <div class="ring-2">
              <div class="ball-holder">
                <div class="ball"></div>
              </div>
            </div>
          </div>
        </div>`
      )

      break;
    case 'stats':
      gameRow = document.querySelector(`#game-${options.gameId}`)
      const spinner = gameRow.children.namedItem('stats-spinner')

      if (options.removeElem) {
        options.removeElem.remove()

        break;
      }

      if (spinner) {
        spinner.remove()
      }

      const { home_team, visitor_team, ...game } = games.find(game => game.id === options.gameId)

      gameRow.insertAdjacentHTML(
          'beforeend',
          setStatsRow(home_team, visitor_team, game)
      )

      break;
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
const updateAndRender = async (gameId) => {
  const gameRow = document.querySelector(`#game-${gameId}`)
  const hasRenderedStats = gameRow.children.namedItem(`stats-${gameId}`)
  
  render("stats", { gameId, removeElem: hasRenderedStats })
  sessionStorage.setItem('games', JSON.stringify(games))
}

fetchGamesAndRender()