/*

  The types of functions.

  - Base
  - Callbacks.
  - Promises
  - Async/await (Async)
  - Generators

*/


// _________ Base (Recap...) ______________

/*
 - Encapsulating logic
 - Reusability, Maintainability, Understanding
 - Used as building "blocks" | create/build more complex solutions/patterns

 Details: functions have parameters. You give values you those parameters by passing corresponding arguments.
 
 */

 function exampleBaseFunc(param1, param2) {
   //... function body (block of code)
   return `function arguments... arg 1: ${param1} | arg 2: ${param2}`
 }

 console.log(exampleBaseFunc('We are', 'GREAT!'))
 /* 
 
 Ex: Methods - The attached function that Objects can have that extends/modifies functionality. So String.toLowerCase()

------
*/

// _________ Callbacks (Callback Functions) ______________

/*
 - A base function that takes a function as an argument with sole purpose of executing it at a later time. 
 Used commonly for continuing a process. Like an Async process.
 - Start a process, get a result and finish that process based on the result.

------
*/

const clockMinElem = document.getElementById('clock-min');
const clockSecElem = document.getElementById('clock-sec');
const team1Score = document.getElementById('team1-score');
const team2Score = document.getElementById('team2-score');

let clock = 720

function pad(val) {
  let valString = val + "";

  if (valString.length < 2) {
    return "0" + valString;
  } else {
    return valString;
  }
}


function setTeamScore(team, score) {
  team.innerHTML = score
}

function logScore(team, score) {
  const scoreSheet = {
    oldScore: team.innerHTML,
    newScore: score
  }

  console.table(scoreSheet)

  return scoreSheet
}

// Apply score function
function applyScore(selectTeam1, points, setScoreCb) {
  const team = selectTeam1 ? team1Score : team2Score
  setScoreCb(team, parseInt(team.innerHTML) + points)
}

function generateScore() {
  // Use Math.random to decide if a score should be applied and what score to add.

  // Math.random. Result determines what team gets the points if we should add.

  // Math.random between 2 & 3 for score.

  // Apply score

  const shouldAddScore = Math.round(Math.random())
  if (shouldAddScore) {
    const whichTeam = Math.round(Math.random())
    const points = Math.floor(whichTeam * (3 - 2) + 2)
    // whichTeam ? team1Score.innerHTML = parseInt(team1Score.innerHTML) + points : team2Score.innerHTML = parseInt(team2Score.innerHTML) + points
    applyScore(whichTeam, points, setTeamScore);
    applyScore(whichTeam, points, logScore)
  }
}


// a generic number function that will return the desired mod.
function modifyNumber(num, modifier, modifierCb) {
  return modifierCb ? window[modifier](modifierCb(num)) : window[modifier](num)
}

// Countdown clock
function countdownClock() {
  --clock;
  clockMinElem.innerHTML = modifyNumber(clock / 60, 'pad', parseInt);
  clockSecElem.innerHTML = modifyNumber(clock % 60, 'pad');

  if (clock == "0" || clock === "00:00") {
    clearInterval(clockIntervalId)
  }
}

// Interval Callback
function intervalCallback() {
  countdownClock()
  generateScore()
}

const clockIntervalId = setInterval(intervalCallback, 1000)



