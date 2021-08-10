var a = new Boolean(false);
var b = new Number(0);
var c = new String("");

var d = Boolean(a && b && c);

console.log("a:", a);
console.log("b:", b);
console.log("c:", c);
console.log("d:", d);

console.log("boolean(a):", Boolean(a));
console.log("boolean(b):", Boolean(b));
console.log("boolean(c):", Boolean(c));
console.log("boolean(d):", Boolean(d));
