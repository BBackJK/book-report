var a = [1, 2];
var b = [3, 4];

console.log(a + b);

console.log(a.toString());

var d = [1, 2, function() { return '1'; }, [0]];

console.log(d.toString());

console.log("true".valueOf());
console.log("true".toString());

console.log(Boolean("true").valueOf());


console.log("true" == true);