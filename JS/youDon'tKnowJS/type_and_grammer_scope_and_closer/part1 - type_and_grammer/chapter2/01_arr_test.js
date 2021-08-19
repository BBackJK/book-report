var a = [];

a["13"] = 42;

console.log(a.length);


function foo() {
  var arr = Array.prototype.slice.call(arguments);
  arr.push("bam");
  console.log(arr);
}

foo("bar", "baz");


var a = "foo";
var b = ["f", "o",  "o"];

console.log(a === b);
console.log(a == b);

var c = Array.prototype.join(a, "-");
var d = Array.prototype.join.call(a, "-");

console.log(c);
console.log(d);
