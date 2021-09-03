// function identify(context) {
//   console.log(context);
//   return context.name.toUpperCase();
// }

// function speak(context) {
//   var greeting = "Hello, I'm " + identify(context);
//   console.log(greeting);
// }

// var me = {
//   name : "Kyle"
// };

// var you = {
//   name : "Reader"
// };

// console.log(identify(you));
// speak(me);


function identify() {
  console.log(this);
  return this.name.toUpperCase();
}

function speak() {
  console.log(this);
  var greeting = "Hello, I'm " + identify.call(this);
  console.log(greeting);
}

var me = {
  name : "Kyle"
};

var you = {
  name : "Reader"
};

identify.call(me);      // KYLE
identify.call(you);     // READER

speak.call(me);         // Hello, I'm KYLE
speak.call(you);        // Hello, I'm READER