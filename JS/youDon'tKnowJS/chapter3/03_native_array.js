var a = new Array(3);
var b = [undefined, undefined, undefined];

console.log(a);
console.log(b);

console.log(a.join('-'));
console.log(b.join('-'));

console.log(a);
console.log(b);

var c = a.map(function(v, i) { return i; });
var d = b.map(function(v, i) { return i; });

console.log(c);
console.log(d);


console.log(a.length);
