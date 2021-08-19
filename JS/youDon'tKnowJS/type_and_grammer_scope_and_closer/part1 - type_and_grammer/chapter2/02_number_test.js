function numbersCloseEnoughToEquals(n1, n2) {
  return Math.abs(n1 - n2) < Number.EPSILON;
}

var a = 0.1 + 0.2;
var b = 0.3;

console.log(a);
console.log(b);

console.log(numbersCloseEnoughToEquals(a, b)); // true
console.log(numbersCloseEnoughToEquals(0.0000001, 0.0000002)); // false
