# this라나 뭐라나

자바스크립트에서 가장 헷갈리는 메커니즘 중 하나가 바로 `this` 키워드 이다.

`this`는 모든 함수 스코프 내에 자동으로 설정되는 특수한 식별자로 경험 많은 자바스크립트 개발자도 정확히 무엇을 가리키는지 짚어내기가 만만치 않다.

## 1. this를 왜?

this의 유용함과 사용 동기를 알아보자.

다음과 같은 코드를 보자.

`identify()`와 `speak()` 두 함수는 객체별로 따로따로 함수를 작성할 필요 없이 다중 콘텍스트 객체인 me와 you 모두에서 재사용할 수 있다.

```js
function identify() {
  return this.name.toUpperCase();
}

function speek() {
  var greeting = "Hello, I'm " + identify.call(this);
  console.log(greeting);
}

var me = {
  name : "Kyle"
};

var you = {
  name : "Reader"
};

identify.call(me);      // KYLE
identify.call(you);     // READER

speak.call(me);         // Hello, I'm KYLE
speak.call(you);        // Hello, I'm READER
```

`this`를 쓰지 않고 `identify()`와 `speak()` 함수에 콘텍스트 객체를 명시할 수도 있다.

```js
function identify(context) {
  return context.name.toUpperCase();
}

function speak(context) {
  var greeting = "Hello, I'm" + identify(context);
  console.log(greeting);
}

identify(you);
speak(me);
```

하지만 암시적인 객체 레퍼런스를 함께 넘기는 this 체계가 API 설계 상 좀 더 깔끔하고 명확하며 재사용하기 쉽다.

사용 패턴이 복잡해질수록 보통 명시적인 인자로 콘텍스트를 넘기는 방법이 this 콘텍스트를 사용하는 것보다 코드가 더 지저분해진다. 뒷부분에서 객체와 프로토타입을 배우고 나면 여러 함수가 적절한 콘텍스트를 자동 참조하는 구조가 얼마나 편리한지 실감하게 될 것이다.

## 2. 헷갈리는 것들

보통 개발자들은 this를 다음 두 가지로 해석한다.

### 2.1 자기 자신

우선 `this`가 함수 그 자체를 가리킨다는 오해다.

재귀 로직이 들어가는 경우도 있고, 최초 호출 시 이벤트에 바인딩 된 함수 자신을 언바인딩할 때도 자기 참조가 필요하다.

보통 함수를 객체 `(자바스크립트의 모든 함수는 객체다.)`로 참조함으로써 함수 호출 간 `[상태](프로퍼티 값)`을 저장할 수 있을 거로 생각한다.

우선 여기서 함수가 `this`로 자기 참조를 할 수 없다는 것을 증명하기 위해 한 가지 패턴을 사용해 보겠다.

`foo` 함수 호출 횟수를 추적하는 예제이다.

```js
function foo(num) {
  console.log("foo: " + num);

  // 'foo'가 몇 번 호출됐는지 추적한다.
  this.count++;
}

foo.count = 0;
var i;

for (i = 0; i < 10; i++) {
  if (i > 5) {
    foo (i);
  }
}

// foo: 6
// foo: 7
// foo: 8
// foo: 9

// 'foo'는 몇 번 호출됐을까?
console.log(foo.count); // 0
```

분명 `foo.count = 0`을 하여 `foo`라는 함수 객체에 `count`라는 프로퍼티가 추가된다.

하지만 `this.count`에서 `this`는 함수 객체를 바라보는 것이 아니며, 프로퍼티 명이 똑같아 헷갈리지만 근거지를 둔 객체 자체가 다르다.

**함수가 내부에서 자기 자신을 참조할 때 일반적으로 `this`만으로 부족하여 렉시컬 식별자(변수)를 거쳐 함수 객체를 참조한다.**

다음 두 함수를 보자.

```js
function foo() {
  foo.count = 4;    // 'foo'는 자기 자신을 가리킨다.
}

setTimeout( function() {
  // 익명 함수는 자기 자신을 가리킬 방법이 없다.
}, 10);
```

네임드 함수라 불리는 `foo`함수는 `foo`라는 함수명 자체가 내부에서 자신을 가리키는 레퍼런스로 쓰인다.

하지만 `setTimeout()`에 콜백으로 전달한 함수는 이름 식별자가 없으므로 함수 자신을 참조할 방법이 마땅치 않다.

> arguments.callee는 실행 중인 함수 자체를 가리키지만 지금은 권장하지 않는 레퍼런스다(deprecated 됨.)

그러므로 위 예제는 다음과 같이 쓸 수 있다.

```js
function foo(num) {
  console.log( "foo: " + num);

  // 'foo'가 몇 번 호출됐는지 추적한다.
  foo.count++;
}

foo.count = 0;

var i;

for (i=0; i<10;i++) {
  if (i > 5) {
    foo(i);
  }
}

// foo: 6
// foo: 7
// foo: 8
// foo: 9

// 'foo'는 몇 번 호출됐을까?
console.log(foo.count); // 4
```

하지만 이 예제 역시 `this`에 대한 재대로된 이해 없이 렉시컬 스코프에 의존하여 해결한 경우이다.

그럼 렉시컬 스코프에 의존하지 않은 예제를 보자.

```js
function foo(num) {
  console.log("foo: " + num);

  // 'foo'가 몇번 호출됐는지 추적한다.
  // 참고: 'this'는 'foo'를 어떻게 호출하느냐에 따라 진짜 'foo'가 된다.
  this.count++;
}

foo.count = 0;
var i;

for (i = 0; i < 10; i++) {
  if (i > 5) {
    // 'call()'함수로 호출함으로
    // 'this'는 이제 확실히 함수 객체 'foo'자신을 가리킨다.
    foo.call(foo, i);
  }
}

// foo: 6
// foo: 7
// foo: 8
// foo: 9

// 'foo'는 몇 번 사용했을까?
console.log(foo.count); // 4
```

### 2.2 자신의 스코프

this가 바로 함수의 스코프를 가리킨다는 말은 아주 흔한 오해다.

확실한 것은 **`this`는 어떤 식으로도 함수의 렉시컬 스코프를 참조하지 않는다는 사실.**

내부적으로 스코프는 별개의 식별자가 달린 프로퍼티로 구성된 객체의 일종이나 스코프 '객체'는 자바스크립트 구현체인 '엔진'의 내부 부품이기때문에 일반 자바스크립트 코드로는 접근하지 못한다.

넘지말아야할 선을 넘어 `this`가 암시적으로 함수의 렉시컬 스코프를 가리키도록 해보자.(물론 실패한다.)

```js
function foo() {
  var a = 2;
  this.bar();
}

function bar() {
  console.log(this.a);
}

foo();  // Reference Error: a is not defined.
```

억지로 만든 예제 코드처럼 보이지만 실제로 커뮤니티에서 공유되는 코드이다.

`bar()`함수를 `this.bar()`로 참조하려는 것부터가 문제다. `bar()` 앞의 `this`를 빼고 식별자를 어휘적으로 참조하는 것이 가장 자연스러운 호출 방법이다.

물론 이 코드의 작성자는 `foo()`와 `bar()`의 렉시컬 스코프 사이에 어떤 연결 통로를 만들어

`bar()`가 `foo()`의 내부 스코프에 있는 변수 a에 접근하게 하고 싶었을 것이다.

그러나 그런 연결 통로는 없으며, 렉시컬 스코프 안에 있는 뭔가를 `this` 레퍼런스로 참조하기란 애당초 가능하지 않다.

## 3. this란 무엇인가?

그렇다면 진짜 this에 대해서 어떻게 작동하는지 알아보자.

**`this`는 작성 시점이 아닌 런타임 시점에 바인딩 되며 함수 호출 당시 상황에 따라 콘텍스트가 결정된다고 말했다.**

함수 선언 위치와 상관 없이 `this` 바인딩은 오로지 어떻게 함수를 호출했느냐에 따라 정해진다.

어떤 함수를 호출하면 **활성화 레코드(Activation Record)**, 즉 **실행 콘텍스트(Execution Context)** 가 만들어진다.

여기엔 함수가 호출된 **근원(Call-stack)** 과 호출 방법, 전달된 인자 등의 정보가 담겨져 있다.

`this` 레퍼런스는 그 중 하나로, 함수가 실행되는 동안 이용할 수 있다.


