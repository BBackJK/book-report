function foo(str) {

  var matches;

  if (str) {

    matches = str.match(/[aeiou]/g);

    console.log(matches);

    if (matches) {
      return matches;
    }
  }
}

foo("Hello World");
