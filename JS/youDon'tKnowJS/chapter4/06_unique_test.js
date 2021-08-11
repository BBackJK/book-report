Number.prototype.valueOf = function() {
  return 3;
}

console.log(new Number(2));
console.log(new Number(2).valueOf());

console.log(new Number(2) == 3);

console.log("####################################");
console.log("####################################");
console.log("####################################");


var i = 2;

Number.prototype.valueOf = function() {
  return i++;
}

var a = new Number(42);

console.log(a);
console.log(a.valueOf());
