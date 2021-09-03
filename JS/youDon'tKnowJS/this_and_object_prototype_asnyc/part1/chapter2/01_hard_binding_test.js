// function foo(something) {
//   console.log(this.a, something);
//   return this.a + something;
// }

// var obj = {
//   a: 2
// };

// var bar = function() {
//   return foo.apply(obj, arguments);
// };

// var b = bar(3); // 2 3
// console.log(b); // 5


// function foo(something) {
//   console.log(this);
//   console.log(this.a, something);
//   return this.a + something;
// }

// var obj = {
//   a: 2
// };

// var bar = foo.bind(obj);

// console.log(bar);
// console.log(foo);

// var b = bar(3);   // 2 3
// console.log(b);   // 5

function foo(el) {
  console.log(el, this.id);
}

var obj = {
  id: 'good boy'
};

// 'foo' 호출 시 'obj'를 'this'로 사용한다.
[4, 2, 3].forEach(foo, obj);
// 1 good boy 2 good boy 3 good boy
