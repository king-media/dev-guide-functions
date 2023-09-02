var funcs = []
// let's create 3 functions
for (var i = 0; i < 3; i++) {
  // and store them in funcs
  funcs[i] = function () {
    // each should log its value.
    console.log('My value:', i)
  }
}
for (var j = 0; j < 3; j++) {
  // and now let's run each one to see
  funcs[j]()
}
