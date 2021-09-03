# 호이스팅

## 1. 닭이 먼저냐 달걀이 먼저냐

자바스크립트 프로그램이 실행되면 코드가 한 줄 한 줄 위에서부터 차례대로 해석될 것이라고 생각하기 쉽다.

하지만 다음을 보자.

```js
a = 2;
var a;
console.log(a); // 2
```

```js
console.log(a);
var a = 2;    // undefined
```

대체 이 부분은 어떻게 처리될까? 선언문(달걀)이 먼저일까? 대입문(닭)이 먼저일까?

## 2. 컴파일러는 두 번 공격한다.

우리는 `var a = 2;`라는 구문을 하나의 구문이라고 보지만,

자바스크립트는 2개의 구문으로 해석한다.

* var a;
* a = 2;

첫 번째 구문은 컴파일레이션 단계에서 처리된다.

두 번째 구문은 실행 단계까지 내버려 둔다.

따라서 

```js
a = 2;
var a;
console.log(a); // 2
```

이 코드는 다음과 같이 해석된다.

```js
var a;
a = 2;
console.log(a);
```

그 다음 두 번째 코드 

```js
console.log(a);
var a = 2;    // undefined
```

이 코드는 다음과 같이 해석된다.

```js
var a;
console.log(a);
a = 2;
```

이렇게 선언문을 끌어올리는 동작은 **호이스팅**이라고 하며, 즉 선언문(달걀)이 대입문(닭)보다 먼저다.

## 3. 함수가 먼저다.

함수와 변수 선언문은 모두 **호이스팅**되어진다.

```js
foo();    // 1
var foo;

function foo() {
  console.log(1);
}

foo = function() {
  console.log(2);
}
```

자바스크립트 엔진은 이 코드를 다음과 같이 해석한다.

```js
function foo() {
  console.log(1);
}

foo();  // 1

foo = function() {
  console.log(2);
}
```

`var foo`가 중복 (그래서 무시된) 선언문이라는 점을 보자. `var foo`는 `function foo()` 선언문보다 앞서 선언됐지만, 함수 선언문이 일반 변수 위로 끌어올려졌다.

```js
foo();    // 3

function foo() {
  console.log(1);
}

var foo = function() {
  console.log(2);
}

function foo() {
  console.log(3);
}
```
