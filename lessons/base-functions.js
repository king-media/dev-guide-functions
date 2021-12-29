/*

  This is a high-level overview of functions. 

  - What are functions.
  - What are some use cases.
  - What are the "types" of functions

*/


// Let's build one
function doSomething(arg) {
  console.log(arg)
  // ...other code
}

doSomething("What's good guys! Study functions!")

// TYPES: Base, Callback, Promise, Async/await (Async), Generators


// _________ Base (Basic) ______________

/*
 - Encapsulating logic
 - Reusability, Maintainability, Understanding
 - Used as building "blocks" | create/build more complex solutions/patterns

 Ex: Utility/Helpers - Functions that help the class/object/piece of code that it is used in order to effect a specific thing.

 Meaning these functions usually follow a specific type "signature" (specific input) => returns a [specific output].
 These are PURE functions that don't trigger unexpected behavior or side effects.

 Ex: Methods - The attached function that Objects can have that extends/modifies functionality. So String.toLowerCase()

------
*/

// string -> string
function generateUID(username) { 
	const idArr= []

  while (idArr.length < 6) { 
    var r = Math.floor(Math.random() * 100) + 1;
    if (idArr.indexOf(r) === -1) 
    idArr.push(r); 
  }

  let uid = idArr.join(',') + username;
  // return uid
  console.log(uid);
}

generateUID('K7NG')
console.log('STRING'.toLowerCase())

// console.log(generateUID('user'))


function multiply(x, y) {
  return x > y
}


console.log(multiply(5, 7))