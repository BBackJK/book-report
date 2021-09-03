# 함수 vs 블록 스코프

## 1. 함수 기반 스코프

자바스크립트는 함수 기반 스코프를 사용하기 때문에 각각의 선언된 함수는 저마다의 버블(스코프)을 생성하지만 다른 어떤 자료 구조도 자체적인 스코프를 생성하지 않는다.

라고 하지만 이는 사실이 아니다.

```js
function foo(a) {
  var b = 2;

  function bar() {
    // ...
  }

  var c = 3;
}
```

`foo()`의 스코프에서는 확인자(변수)인 a, b, c 와 함수 `bar()`가 있어서, `foo()` 외부에서는 이 확인자와 함수에 접근을 할 수 없기 때문에 `ReferenceError`가 발생한다.

하지만 이 모든 확인자는 당연히 `foo()` 스코프 안에 있기 때문에 `foo()`에서 사용이 가능하고, `bar()` 내부에서조차 사용이 가능하다.

즉, **함수 스코프는 모든 변수가 함수에 속하고 함수 전체에 걸쳐 사용되며 재사용된다는 개념**을 확고하게 한다.

이러한 디자인 접근법은 상당히 유용하고 자바스크립트 변수의 **동적** 특성을 완전히 살려 다른 타입의 값을 필요에 따라 가져올 수 있지만, 스코프 전체에서 변수가 살아있다는 점에서 버그를 발생시킬 수 있다.

## 2. 일반 스코프에 숨기

함수에 대한 전통적인 개념은 다음과 같다.

* 함수를 선언하고 그 안에 코드를 넣는다. 바꿔 생각해보는 것도 꽤 유용하다.
* 작성한 코드에서 임의 부분을 함수 선언문으로 감싼다. 이는 해당 코드를 '숨기는' 효과를 낸다.

감싸진 코드 안에 있는 '모든 변수' 또는 '함수 선언문'은 이전 코드에 포함됐던 스코프가 아니라 새로이 코드를 감싼 함수의 스코프에 묶인다.

다르게 말하면, 함수의 스코프로 둘러싸서 변수와 함수를 '숨길'수 있다는 것이다.

스코프를 이용해 숨기는 방식을 사용하는 이유는 여러 가지가 있는데, 소프트웨어 디자인 원칙인 **'최소 권한의 원칙'**과 관련이 있다. 

이 원칙은 모듈/객체의 API와 같은 소프트웨어를 설계할 때 필요한 것만 최소한으로 남기고 나머지는 숨겨야 한다는 것.

이러한 원칙은 어떤 스코프가 변수와 함수를 포함하는지에 관한 문제와 관련이 있는데, 모든 변수와 함수가 글로벌 스코프에 존재한다면 어느 중첩된 하위 스코프에서도 이들에 접근할 수 있다. 그렇다면 이는 **최소 권한의 원칙**에 어기는 것이고, 많은 코드들을 노출하게 된다.

```js
function doSomething(a) {
  b = a + doSomethingElse(a * 2);

  console.log(b * 3);
}

function doSomethingElse(a) {
  return a - 1;
}

var b;

doSomething(2); // 15
```

이 코드에서 변수 b와 함수 doSomethingElse()는 doSomething()이 어떤 작업을 하는지 보여주는 '비공개'부분이라고 볼 수 있다.

변수 b와 doSomethingElse()에 접근할 수 있도록 내버려 두는 것은 불필요할 뿐 아니라 위험할 수 있다.

더 적절하게 설계하려면 다음과 같이 해야한다.

```js
function doSomething(a) {
  function doSomethingElse(a) {
    return a - 1;
  }
  var b;
  b = a + doSomethingElse(a * 2);
  console.log(b * 3);
}

doSomething(2); // 15
```

### 2.1 충돌 회피

변수와 함수를 스코프 안에 '숨기는 것'의 또다른 장점은 같은 이름은 가졌지만 다른 용도를 가진 두 확인자(변수)가 충돌하는 것을 피할 수 있다는 점.

```js
function foo() {
  function bar(a) {
    i = 3;
    console.log(a + i);
  }

  for (var i = 0; i < 10; i++) {
    bar(i * 2); // 무한 루프
  }
}

foo();
```

여기서 `bar()` 함수 안에 어떤 확인자 이름을 고르든 지역 변수로 선언해서 사용해야 무한 루프를 예방할 수 있다.


## 3. 스코프 역할을 하는 함수

```js
var a = 2;

function foo() {
  var a = 3;
  console.log(a);   // 3
}

foo();

console.log(a);     // 2
```

작동하긴 하지만 이상적인 방식은 아니다.

```js
var a = 2;

(function foo() {
  var a = 3;
  console.log(a);   // 3
})();

console.log(a);     // 2
```

여기서 함수 선언문과 함수 표현식의 중요한 차이는 함수 이름이 어디의 확인자로 묶이느냐와 관련이 있다.

### 3.1 익명 vs 기명

```js
setTimeout(function() {
  console.log("I waited 1 second!");
}, 1000);
```

이런 방식을 `익명 함수 표현식`이라고 하는데 이는 `function()...` 에 확인자 이름이 없기 때문이다.

이런식으로 함수표현식은 이름 없이 사용할 수 있지만, 함수 선언문에는 이름이 빠져서는 안된다.

이름 없는 함수 선언문은 자바스크립트 문법에 맞지 않다.

`익명 함수 표현식`은 빠르고 쉽게 입력할 수 있어서 많은 라이브러리와 도구가 이 자바스크립트 특유의 표현법을 권장하지만 다음과 같은 단점이 있다.

1. 익명 함수는 스택 추적 시 표시할 이름이 없어서 디버깅이 더 어려울 수 있다.
2. 이름 없이 함수 스스로 재귀 호출을 하려면 불행히도 폐기 예정인 arguments.callee 참조가 필요하다. 자기 참조가 필요한 또 다른 예로는 한 번 실행하면 해제되는 이벤트 처리함수가 있다.
3. 이름은 보통 쉽게 이해하고 읽을 수 있는 코드 작성에 도움이 되는데, 익명 함수는 이런 이름을 생략한다. 기능을 잘 나타내는 이름은 해당 코드를 그 자체로 설명하는데 도움이 된다.

반면에 `인라인 함수 표현식`은 매우 효과적이고 유용하다. 익명이냐 기명이냐의 문제가 이 사실을 퇴색시키지는 않는다.

함수 표현식에 이름을 사용하면 특별한 부작용 없이 상당히 효과적으로 앞의 단점을 해결할 수 있다. 따라서 **함수 표현식을 사용할 때 이름을 항상 쓰는 것이 좋다.**

### 3.2 함수 표현식 즉시 호출하기

```js
var a = 2;

(function foo() {
  var a = 3;
  console.log(a); // 3
})();

console.log(a); // 2
```

`( )`로 함수를 감싸면 함수를 표현식으로 바꾸는데, `(function foo() {})()`처럼 마지막에 또 다른 `( )`를 붙히면 함수를 실행할 수 있다. 함수를 둘러싼 첫 번째 `( )`는 함수를 표현식으로 바꾸고, 두 번째 `( )`는 함수를 실행시킨다.

이러한 패턴은 굉장히 흔해서 ``즉시 호출 함수 표현식(IIFE)``라고 용어를 만들기도 했다.

이러한 IIFE에서도 인자를 사용하는 방법이 있다.

```js
var a = 2;

(function IIFE(global) {
  var a = 3;
  console.log(a); // 3
  console.log(global.a);  // 2
})(window);

console.log(a);
```

위에서는 `window`객체를 참조하여 `global`이라는 이름 붙힌 인자에 넘겨서 글로벌 참조와 비 글로벌 참조 사이에 명확한 차이를 만들었다.


## 4. 스코프 역할을 하는 블록

함수가 가장 일반적인 스코프 단위이자 현재 자바스크립트에서 통용되는 가장 널리 퍼진 디자인 접근법이기는 하지만, 다른 스코프 단위도 존재하고 이를 이용하면 더 좋은 깔끔한 코드를 작성할 수 있다.

```js
for (var i = 0; i < 10; i++) {
  console.log(i);
}
```

변수 `i`를 `for 반복문`의 시작부에 선언하는 이유는 보통 `i`를 오직 `for 반복문`과 관련해서 사용하려 하기 때문이다. 그러고는 변수 `i`가 실제로는 둘러싼 스코프에 포함된다는 사실을 무시한다. 블록 스코프의 목적이 이것이다.

**변수를 최대한 사용처 가까이에서 최대한 작은 유효 범위를 갖도록 선언하는 것.**

```js
var foo = true;

if (foo) {
  var bar = foo * 2;
  bar = something(bar);
  console.log(bar);
}
```

변수 `bar`는 오직 if문 안에서만 사용하므로, `bar`를 if 블록 안에 선언하는 것은 타당하다.

그러나 사실 var를 사용할 때에는 변수를 어디에서 선언하는지는 중요한 문제가 아니다.

**선언된 변수는 항상 둘러쌓인 스코프에 속하기 때문**이다.

위에 예제는 보기에만 스코프처럼 보이는 '가짜' 블록 스코프로, `bar`를 의도치 않게 다른 곳에서 사용하지 않도록 상기시키기 위함이다.

블록 스코프는 앞서 언급한 **최소 권한 노출의 원칙**을 확장하여 정보를 함수 안에 숨기고, 나아가 정보를 코드 블록 안에 숨기기 위한 도구이다.

그렇다면 

```js
for (var i = 0; i < 10; i++) {
  console.log(i)
}
```

오직 for문에서만 사용되어야만 할 변수 `i`로 함수 스코프 전체를 오염시켜야 할까?

무엇보다 개발자들은 의도하지 않게 변수가 원래 용도 의외의 곳에서 (재)사용됐는지 점검하고 싶어 한다. 예를 들어, 정해진 장소 밖에서 변수가 사용되면 알려지지 않은 변수라는 오류가 발생한다는 식으로 말이다.

블록 스코프를 사용한다면 변수 `i`는 오직 for 반복문안에서만 사용할 수 있고, 이외 함수 어느 곳에서 접근하더라도 오류가 발생할 것이다.

### 4.2 try/catch

잘 알려지지 않은 사실이지만, `try/catch` 문 중 `catch` 부분에서 선언된 변수는 catch 블록스코프에 속한다.

```js
try {
  undefined();    // illegal operation to force an exception
} catch (err) {
  console.log(err); // say error messsage... (work!)
}

console.log(err); // ReferenceError: `err` not found
```

보시다시피, 변수 `err`는 오직 `catch` 문 안에서만 존재하므로 다른 곳에서 참조하면 오류가 발생한다.

### 4.3 let

자바스크립트 ES6에서 새로운 키워드 `let`을 만들었다.

`let`은 `var`와 같이 변수를 선언하는 **다른** 방식이다.

키워드 `let`은 선언된 변수를 둘러싼 아무 블록의 스코프에 붙힌다.

```js
var foo = true;

if (foo) {
  let bar = foo * 2;
  bar = something(bar);
  console.log(bar);
}

console.log(bar); // ReferenceError
```

`let`을 이용해 변수를 현재 블록에 붙히는 것은 **약간 비명시적**이다.

코드를 작성하다 보면 블록이 왔다 갔다 하고 다른 블록으로 감싸기도 하는데, 

이럴 때 주의하지 않으면 변수가 어느 블록 스코프에 속한 것인지 착각하기 쉽다.

다음은 명시적으로 블록을 생성하여 쓴 코드이다.

```js
var foo = true;

if (foo) {
  { // explicit block
    let bar = foo * 2;
    bar = something(bar);
    console.log(bar);
  }
}

console.log(bar);
```

이렇게 하면 나중에 리팩토링 하면서 if문의 위치나 의미를 변화시키지 않고도 전체 블록을 옮기기가 쉬워진다.


#### 가비지 콜렉션 (Garbage Collection)

블록 스코프가 유용한 또 다른 이유는 **메모리를 회수하기 위한 클로저** 그리고 **가비지 콜렉션**과 관련이 있다.

```js
function process(data) {
  // do something interesting
}

var someReallyBigData = { ... };

process(someReallyBigData);

var btn = document.getElementById("my_button");

btn.addEventListener("click", function click(event) {
  console.log("button clicked");
}, /* capturingPhase= */false);
```

클릭을 처리하는 `click`함수는 `someReallyBigData` 변수가 전혀 필요 없다.

따라서, 이론적으로는 `process()`가 실행된 후 많은 메모리를 먹는 자료 구조인 `someReallyBigData`는 수거할 수도 있다.

그러나 자바스크립트 엔진은 그 데이터를 여전히 남겨둘 것이다.

**`click` 함수가 해당 스코프 전체의 클로저를 가지고 있기 때문이다.**

블록 스코프는 엔진에게 `someReallyBigData`가 더는 필요 없다는 사실을 더 명료하게 알려서 이 문제를 해결할 수 있다.

```js
function process(data) {
  // do something interesting...
}

// anything declared inside this block can go away after!
{
  let someReallyBigData = { ... };
  process(someReallyBigData);
}

var btn = document.getElementById("my_button");

btn.addEventListener("click", function click(evt) {
  console.log("button click event!!");
}, /*capturingPhase=*/false);
```

위 처럼 **명시적으로 블록을 선언하여 변수의 영역을 한정하는 것은 효과적인 코딩 방식**이다.

###  4.4 const 

`let`과 동일하게 블록 스코프를 만들어주지만 한번 지정된 값은 변경될 수 없으며, 선언하자마자 값을 지정해주어야 한다.

