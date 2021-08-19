function getData() {
  return {
    a: 42,
    b: "foo"
  }
}

var { a: at, b: bt} = getData();

console.log(at);
console.log(bt);