var a = new Boolean(false);

console.log(a);
console.log(a.toString());
console.log(a.valueOf());

if (!a.valueOf()) {
  console.log('a is false!!');
}
