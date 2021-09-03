# 문법

## 1. 문과 표현식

문(statement)과 표현식(expression).

```js
var a = 3 * 6;
var b = a;

console.log(b); // 18
```

각 라인은 표현식이라고 하며,

`var a = 3 * 6, var b = a` 두 문은 각각 변수를 선언하므로 **선언문**이라고 하며,

(앞에 var가 빠진) `a = 3 * 6, b = a`는 **할당 표현식**이라고 한다.

### 1.1 문의 완료 값

모든 문은 완료 값을 가진다.

그렇다면 ``var b = a;``의 완료값은 무엇일까?

var 문 자체의 완료 값은 undefined이다.

콘솔창이 내어준 완료 값은 개발자가 잡을 수 있는 방법이 존재한다.

다음과 같은 코드에서. 보통의 `{ }` 블록은 내부의 가장 마지막 문/표현식의 완료 값을 자신의 완료 값으로 반환한다.

```js
var b;

if (true) {
  b = 4 + 38;
}
```

콘솔창에서 실행하면 42가 나온다.

즉, 블록(`{ }`)의 완료 값은 내부의 있는 마지막 문의 값을 암시적으로 반환하는 것.

그럼 다음과 같은 코드가 작동하지 않는다는 것은 문제가 있다.

```js
var a, b;

a = if (true) {
  b = 4 + 38;
}
```

이런식으로 문의 값을 암시적으로 변환하여 변수에 할당하는 것은 불가능하다.

이런식으로 할당할 수 있게 해주는 함수가 있다.

```js
var a, b;
a = eval( "if (true) { b = 4 + 38; }" );

a;    // 42
```

좋은 방법은 아니지만 어쨋든 돌아간다.

ES7 명세에서는 `do`표현식이 제안되었다.

```js
var a, b;

a = do {
  if (true) {
    b = 4 + 38;
  }
};

a;    // 42
```

`do` 표현식은 블록 실행 후 블록 내 마지막 문의 완료 값을 do 표현식의 전체 완료 값으로 반환한다.

> 참고로 `eval()` 같은 함수는 절대 사용하지말자.

### 1.2 표현식의 부수효과

대부분의 표현식에는 부수효과가 없다.

```js
var a = 2;
var b = a + 3;
```

하지만 예외가 있는데, 다음 상황은 부수효과가 존재하는 전형적인 예이다.

```js
function foo() {
  a = a + 1;
}

var a = 1;
foo();  // 결과값: undefined, 부수 효과: a가 반영됨.
```

다른 부수효과를 지닌 코드를 보자.

```js
var a = 42;
var b = a++;
```

표현식 `a++`이 하는 일은 두 가지이다. a의 현재 값 42를 반환. 그 이후 a를 1만큼 증가시킨다.

`++`는 전위 혹은 후위에 사용이 가능한데, 후위에 있을 경우 앞에서 말한 것처럼 동작하고, 전위에 있을 경우 먼저 a를 1만큼 증가 시키고, 그 증가된 a의 값을 반환한다.


`delete` 연산자 또한 부수효과를 일으키는 연산자이다.

`delete`는 객체의 프로퍼티를 없애거나 배열에서 슬롯을 제거할 때 사용한다.

```js
var obj = {
  a: 42
};

obj.a;  // 42
delete obj.a;   // true
obj.a;  // undefined
```

다음과 같은 문자열에서 모음을 추출하는 코드를 보자.

```js
function vowels(str) {
  var matches;

  if (str) {
    // 모든 모음을 추출한다.
    matches = str.match(/[aeiou]/g);

    if (matches) {
      return matches;
    }
  }
}

vowels("Hello World");
```

많은 개발자들이 이렇게 작성하지만 할당 연산자의 부수효과를 잘 이용하면 코드를 더 줄일 수 있다.

```js
function vowels(str) {
  var matches;

  if (str && (matches = str.match(/[aeiou]/g))) {
    return matches;
  }
}

vowels("Hello World");
```

### 1.3 콘텍스트 규칙

#### 중괄호

자바스크립트에서 중괄호가 나올 경우는 크게 2가지 경우로 나누어볼 수 있다.

#### 1. 객체 리터럴

```js
var a = {
  foo: function() { /** ... **/ }
};
```

#### 2. 레이블

방금 전 코드에서 `var a =` 부분을 삭제하면 어떻게 될까?

```js
{
  foo: bar()
}
```

중괄호 `{ }` 는 어디에도 할당되지 않은, 그저 고립된 객체 리터럴처럼 보이지만, 그렇지 않다.

여기서의 `{ }`는 평범한 블록 코드이다.

자바스크립트에서는 `레이블 문`이라고 불리우는 기능이 있다 (사용은 하지 말자 왠만하면...)

즉, foo 는 bar()의 레이블이다.

다음 코드를 보자.

```js
// 'foo' 레이블 루프
foo: for (var i=0; i<4 ; i++) {
  for (var j=0; j<4 ; j++) {

    // 두 루프의 반복자가 같을 때마다 바깥쪽 루프(foo)로 점프한다.
    if (j == i) {
      continue foo;
    }

    // 홀수 배수는 건너뛴다.
    if ((j * i) % 2 == 1) {
      // 평범한, 안쪽 루프의 continue
      continue;
    }

    console.log(i, j);
  }
}

// 1 0
// 2 0
// 2 1
// 3 0
// 3 2
```

#### 객체 분해

ES6에서부터는 분해 할당을 사용한다.

```js
function getData() {
  // ...

  return {
    a: 42,
    b: "foo"
  };
}

var { a, b } = getData();

console.log(a, b);    // 42 "foo"
```

이러한 구조분해할당은 인자에서도 아주 유용하다.

```js
function foo({a, b, c}) {
  // var a = obj.a, b = obj.b, c = obj.c;
  console.log(a, b, c);
}

foo ({
  c: [1, 2, 3],
  a: 42,
  b: "foo"
}); // 42 "foo" [1, 2, 3]
```


#### else if 와 선택적 블록

다음과 같은 코드가 잘 작동한다고 해서

자바스크립트에 `else if`절이 있다고 믿는 것은 미신을 믿는 것과 같다.

```js
if (a) {
  // ...
}

else if (b) {
  // ...
}
else {
  // ...
}
```

사실 자바스크립트에는 `else if` 같은 구문은 존재하지 않는다.

위에 코드는 다음과 같이 파싱된다.

```js
if (a) {
  // ...
}

else {
  if (b) {
    // ...
  }
  else {
    // ...
  }
}
```

## 2. 연산자 우선순위

자바스크립트에서 `&&`와 `||`은 피연산자 선택자라고 말했던적이 있다.

피연산자가 2개라면 값을 쉽게 추론할 수 있지만

만약 3개 이상이라면?

```js
var a = 42;
var b = "foo";
var c = [1, 2, 3];

a && b || c;
a || b && c;
```

이러한 경우에 어떤 결과값이 나오는지 예측을 하기위해 **연산자 우선순위**를 알아야한다.

```js
var a = 42, b;

b = ( a++, a );

a;    // 43
b;    // 43
```

여기서 만약 `( )`를 뺀다면?

a는 43, b는 42가 나온다.

이유는 `, `연산자가 `=` 연산자보다 우선순위가 낮기 때문이다.

그러므로 `b = a++, a`를 엔진은 `(b = a++), a`로 해석하기 때문에 b는 42라는 결과값이 나온다.

### 2.1 단락 평가

단락평가는 아주 유요아고 자주 쓰인다

```js
function doSomething(opts) {
  if (opts && opts.cool) {
    // ...
  }
}
```

`opts && opts.cool` 에서 ``opts``는 일종의 가드다. 만약 opts가 존재하지 않는다면 당연히 opts.cool 표현식은 에러일 수 밖에 없다.

### 2.2 끈끈한 우정

`&&`는 `||`보다 `||`는 `?, :`보다 각각 우선순위가 높다.

그래서

```js
a && b || c ? c || b ? a : c && b : a
```

코드는 다음과 같이 감쌓여진다.

```js
(a && b || c) ? (c || b) ? a : (c && b) : a
```

## 3. 세미콜론 자동 삽입

ASI (Automatic Semicolon Insertion - 자동 세미콜론 삽입)은 자바스크립트 프로그래밍에서 세미콜론(;)이 누락된 곳에서 엔진이 자동으로 ;을 삽입하는 것을 말한다.

ASI는 새 줄(행 바꿈)에만 적용되며 줄 중간에 삽입되는 경우는 없다.

## 4. 에러

자바스크립트에는 하위 에러 타입 (TypeError, ReferenceError, SyntaxError 등) 뿐만 아니라, 일부 에러는 컴파일 시점에 발생하도록 문법적으로 정의되어 있다.

### 4.1 너무 이른 변수 사용

ES6에는 '임시 데드존' 이라고 하는 TDZ(Temporal Dead Zone)이라는 새로운 개념을 도입했다

TDZ는 아직 초기호를 하지 않아 변수를 참조할 수 없는 코드 영역을 말한다.

ES6 `let` 블록 스코핑이 대표적인 예이다.

```js
{
  a = 2;  // ReferenceError!
  let a;
}
```

## 5. 함수 인자

TDZ 관련 에러는 ES6 디폴트 인자 값에서도 찾아볼 수 있다.

```js
var b = 3;
function foo(a = 42, b = a + b + 5) {
  // ...
}
```

두 번째 디폴트 할당 값에서 좌변 b는 아직 TDZ에 남아있는 b를 참조하려고 하기 때문에 에러를 던진다.

## 6. try ... finally

다음과 같은 코드를 보자

```js
function foo() {
  try {
    return 42;
  }
  finally {
    console.log("Hello!");
  }

  console.log("실행 될리가 없지!");
}

console.log(foo());
// Hello
// 42
```

`throw` 여도 마찬가지이다.

```js
function foo() {
  try {
    throw 42;
  }
  finally {
    console.log("Hello!");
  }

  console.log("실행 될리가 없지!");
}

console.log(foo());
// Hello
// Uncaught Exception: 42
```

만약 `finally` 절에서 예외가 던저지면, 이전의 실행 결과는 모두 무시한다. 즉, 이전에 `try` 블록에서 생성한 완료 값이 있어도 완전히 사장된다.

```js
function foo() {
  try {
    return 42;
  }
  finally {
    throw "어이쿠!";
  }

  console.log("실행 될리가 없지!");
}

console.log(foo());
// Uncaught Exception: "어이쿠!"
```
