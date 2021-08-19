function doSomething() {
  return 0;
}

var a = doSomething;

if (a == null) {
  console.log('a == null is true!!');
}

console.log(Boolean(null));
console.log(0 == Boolean(null));
