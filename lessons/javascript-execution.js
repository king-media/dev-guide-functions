// Hoisting, Phases
// 1. Phase 1: Creation
// 2. Phase 2: Execution

console.log(variable1)
console.log(variable2)
console.log(exampleBaseFunc)

var variable1 = 'You know... 1'
var variable2 = 'You guessed it... 2'

// Synchronous run through
function exampleBaseFunc(param1, param2) {
  //... function body (block of code)
  console.log(variable1 + variable2)
  return `function arguments... arg 1: ${param1} | arg 2: ${param2}`
}

console.log(exampleBaseFunc('We are', 'GREAT!'))

// ------- Function Context & Scope --------------

function exampleScope3() {
  // Can't access arg from exampleScope1 & newArg from scope2
  console.log(`inside scope 3 -> oldArg: ${arg}, newArg: ${newArg}`)
}

function exampleScope1(arg) {
  // Define scope3 fun here...

  // Assign values to window (global)
  function exampleScope2(newArg) {
    // Can access arg from exampleScope1: How
    console.log(`oldArg: ${arg}, newArg: ${newArg}`)
    // Define args inside exampleScope2's context
    global.arg = arg
    this.newArg = newArg
    exampleScope3()
  }

  exampleScope2('scope2')
}

console.log('what logs 1st')
exampleScope1('scope1')
console.log('Is it this??')

//
