# this가 이런 거로군!

## 1. 호출부

`this` 바인딩의 개념을 이해하려면 먼저 호출부, 즉 함수 호출 코드부터 확인하고 *`this`가 가리키는 것* 이 무엇인지 찾아보아야 한다.

다음은 함수 호출부와 호출 스택을 설명하기 위한 예제이다.

```js
function baz() {
  // 호출 스택: 'baz'
  // 따라서 호출부는 전역 스코프 내부다.
  console.log("baz");
  bar();  // <- 'bar'의 호출부
}

function bar() {
  // 호출 스택: 'baz' -> 'bar'
  // 따라서 호출부는 'baz' 내부다.
  console.log('bar');
  foo(); // <- 'foo'의 호출부
}

function foo() {
  // 호출 스택: 'baz' -> 'bar' -> 'foo'
  // 따라서 호출부는 'bar'의 내부다.

  console.log('foo');
}

baz();  // <- 'baz'의 호출부
```

> 크롬 개발자 도구에서 '호출 스택'을 추적하는 디버깅 과정을 참고할 수 있다. <br/> 1. 개발자 도구에서 `Source`를 선택한 뒤 그 밑의 `Snippets` 탭을 클릭. <br/> 2. [Snippets] 영역에서 우측 마우스 버튼을 클릭한 후 콘텍스트 메뉴에서 [New]를 선택하여 새 파일을 생성


## 2. 단지 규칙일 뿐

이제 함수가 실행되는 동안 `this`가 무엇을 호출할지를 호출부가 어떻게 결정하는지 알아보자.

### 2.1 기본 바인딩

첫 번째 규칙은 **가장 평범한 함수 호출인 `단독 함수 실행`에 관한 규칙으로 나머지 규칙에 해당하지 않을 경우 적용되는 `this`의 Default 규칙**이다.

```js
function foo() {
  console.log(this.a);
}

var a = 2;

foo();  // 2
```

`foo()` 함수 호출 시 `this.a`는 전역 객체 a이다. **기본 바인딩이 적용**되어 `this`는 전역 객체를 참조한다.

### 2.2 암시적 바인딩

두 번째 규칙은 **호출부에 콘텍스트 객체가 있는지, 즉 객체의 소유(Owning)/포함(Containing) 여부를 확인하는 것**이다.

```js
function foo() {
  console.log(this.a);
}

var obj = {
  a: 2,
  foo: foo
}

obj.foo();    // 2
```

앞에서 선언한 `foo()` 함수를 obj에서 프로퍼티로 참조하고 있다. `foo()`를 처음부터 `foo` 프로퍼티로 선언하든 이 예제처럼 나중에 레퍼런스로 추가하든 `obj`객체가 이 함수를 정말로 '소유' 하거나, '포함'한 것은 아니다.

그러나 호출부는 `obj` 콘텍스트로 `foo()`를 참조하므로 `obj`객체는 함수 호출 시점에 함수의 레퍼런스를 '소유'하거나 '포함'한다고 볼 수 있다.

함수 레퍼런스에 대한 콘텍스트 객체가 존재할 때 암시적 바인딩(Implicit Binding) 규칙에 따르면 바로 이 콘텍스트 객체가 함수 호출 시 `this`에 바인딩 된다.

즉, `foo()` 호출 시 `obj`는 `this`이니 `this.a`는 `obj.a`가 된다.

#### 암시적 소실

*암시적으로 바인딩 된* 함수에서 바인딩이 소실되는 경우가 있는데 `this` 바인딩이 뜻밖에 헷갈리기 쉬운 경우다.

```js
function foo() {
  console.log(this.a);
}

var obj = {
  a: 2,
  foo: foo
};

var bar = obj.foo;        // 함수 레퍼런스/별명!
var a = "엥, 전역이네!";     // 'a' 역시 전역 객체의 프로퍼티
bar();                    // "엥, 전역이네!" 
```

`bar`는 `obj`의 `foo`를 참조하는 변수 처럼 보이지만 실은 `foo`를 직접 가리키는 또 다른 레퍼런스다. 게다가 호출부에서 그냥 평범하게 `bar()`를 호출하므로 기본 바인딩이 적용된다.

콜백 함수를 전달하는 경우엔 좀 더 애매하게 실행되어 예상외의 결과가 나온다.

```js
function foo() {
  console.log(this.a);
}

function doFoo(fn) {
  // 'fn'은 'foo'의 또 다른 레퍼런스일 뿐이다.

  fn(); // 호출부
}

var obj = {
  a: 2,
  foo: foo
};

var a = "엥, 전역이네!" // 'a' 역시 전역 객체의 프로퍼티

doFoo(obj.foo);       // "엥, 전역이네!"
```

어떤 까닭으로 예기치 않게 `this`가 바뀌게 됐든 여러분이나 나나 콜백 함수의 레퍼런스를 마음대로 통제할 수 없으니 각자의 입맛에 맞게 호출부를 조정할 수도 없다. 바로 뒷부분에서 `this`를 고정해 이 문제를 해결하는 방법을 소개한다.

### 2.3 명시적 바인딩

암시적 바인딩에서 함수 레퍼런스를 객체에 넣기 위해 객체 자신을 변형해야 했고 함수 레퍼런스 프로퍼티를 이용하여 `this`를 간접적으로 바인딩 했다. 그런데 함수 레퍼런스 프로퍼티를 객체에 더하지 않고 어떤 객체를 `this` 바인딩에 이용하겠다는 의지를 코드에 명확히 밝히는 방법은 없을까?

이럴 때 모든 자바스크립트 함수가 함께 사용할 수 있는 아주 적당한 유틸리티([[Prototype]])가 바로 `call()`과 `apply()` 메서드다. 극히 드물겠지만 일부 자바스크립트 호스트 환경은 두 메소드 대신 자신만의 특수한 함수를 제공하기도 한다.

**두 메소드는 `this`에 바인딩 할 객체를 첫째 인자로 받아 함수 호출 시 이 객체를 `this`로 세팅한다. `this`를 지정한 객체로 직접 바인딩 하므로 이를 `명시적 바인딩`이라 한다.**

```js
function foo() {
  console.log(this.a);
}

var obj = {
  a: 2
};

foo.call(obj);
```

`foo.call()`에서 명시적으로 바인딩 하여 함수를 호출하므로 `this`는 반드시 `obj`가 된다.

**객체 대신 단순 원시 값을 인자로 전달하면 원시 값에 대응되는 객체로 래핑(Wrapping)된다.**

이 과정을 박싱된다 라고 한다.

#### 하드 바인딩

명시적 바인딩을 약간 변형한 꼼수가 있다.

```js
function foo() {
  console.log(this.a);
}

var obj = {
  a: 2
};

var bar = function() {
  foo.call(obj);
};

bar();                  // 2
setTimeout(bar, 100);   // 2

// 하드 바인딩 된 'bar'에서 재정의된 this는 의미가 없다.
bar.call(window);
```

함수 `bar()`는 내부에서 `foo.call(obj)`로 `foo`를 호출하면서 `obj`를 `this`에 강제로 바인딩 하도록 하드 코딩한다.

따라서 `bar`를 어떻게 호출하든 이 함수는 항상 `obj`를 바인딩하여 `foo`를 실행한다.

이런 바인딩은 명시적이고 강력해서 **하드 바인딩**이라고 한다.

하드 바인딩으로 함수를 감싸는 형태의 코드는 다음과 같이 인자를 넘기고 반환 값을 돌려받는 창구가 필요할 때 주로 쓰인다.

```js
function foo(something) {
  console.log(this.a, something);
  return this.a + something;
}

var obj = {
  a: 2
};

var bar = function() {
  return foo.apply(obj, arguments);
};

var b = bar(3); // 2 3
console.log(b); // 5
```

재사용 가능한 헬퍼 함수를 쓰는 것도 같은 패턴이다.

```js
function foo(something) {
  console.log(this.a, something);
  return this.a + something;
}

// 간단한 bind 헬퍼
function bind(fn, obj) {
  return function() {
    return fn.apply(obj, arugments);
  };
}

var obj = {
  a: 2
};

var bar = bind(foo, obj);

var b = bar(3); // 2 3
console.log(b); // 5
```

하드 바인딩은 매우 자주 쓰는 패턴이여서 `ES5` 내장 유틸리티 `Function.prototype.bind` 역시 다음과 같이 구현되어있다.

```js
function foo(something) {
  console.log(this.a, something);
  return this.a + something;
}

var obj = {
  a: 2
};

var bar = foo.bind(obj);

var b = bar(3);   // 2 3
console.log(b);   // 5
```

`bind()`는 주어진 `this` 콘텍스트로 원본 함수를 호출하도록 허드 코딩된 새 함수를 반환한다.

#### API 호출 콘텍스트

많은 라이브러리 함수와 자바스크립트 언어 및 호스트 환경에 내장된 여러 새로운 함수는 대게 '콘텍스트'라 불리는 선택적인 인자를 제공한다. 이는 `bind()`를 써서 콜백 함수의 `this`를 지정할 수 없는 경우를 대비한 일종의 예비책이다.

예를 들어, 다음과 같은 함수는 편의상 내부적으로 `call()`이나 `apply()`로 명시적 바인딩을 대신해준다.

```js
function foo(el) {
  console.log(el, this.id);
}

var obj = {
  id: 'good boy'
};

// 'foo' 호출 시 'obj'를 'this'로 사용한다.
[1, 2, 3].forEach(foo, obj);
// 1 good boy 2 good boy 3 good boy
```

### 2.4 new 바인딩

네 번째 바인딩 규칙을 설명하려면 먼저 자바스크립트 함수와 객체에 대한 흔해 빠진 오해 하나를 바로 잡아야 한다.

전통적인 클래스 지향 언어의 생성자는 클래스에 붙은 특별한 메소드로, 다음과 같이 클래스 인스턴스 생성 시 new 연산자로 호출된다.

```c++
something = new MyClass();
```

자바스크립트도 `new` 연산자가 있고 사용 방법은 겉보기엔 다른 클래스 지향 언어와 별 차이가 없어 보여서 그 내부 체계 또한 이와 비슷할 거라 쉽게 단정짓는 사람이 많다.

그러나 사실 자바스크립트에서 `new`는 의미상 클래스 지향적인 기능과 아무런 관련이 없다.

그렇다면, 자바스크립트에서 생성자의 정의를 내려보자.

자바스크립트는 생성자 앞에 `new` 연산자가 있을 때 호출되는 일반 함수에 불과하다. 클래스에 붙은 것도 아니고 클래스 인스턴스화 기능도 없다. 심지어 특별한 함수의 형태도 아니다.

**단지 `new`를 사용하여 호출할 때 자동으로 붙들려 실행되는 그저 평범한 함수다.**

함수 앞에 `new`를 붙혀 생성자 호출을 하면 다음과 같은 일들이 일어난다.

1. 새 객체가 툭 만들어진다.
2. 새로 생성된 객체의 `[[Prototype]]`이 연결된다.
3. 새로 생성된 객체는 해당 함수 호출 시 `this`로 바인딩 된다.
4. 이 함수가 자신의 또 다른 객체를 반환하지 않는 한 `new`와 함께 호출된 함수는 자동으로 새로 생성된 객체를 반환한다.

2번은 나중에 살펴보고, 1, 3, 4를 보자

```js
function foo(a) {
  this.a = a;
}

var bar = new foo(2);
console.log(bar.a); // 2
```

앞에 `new`를 붙혀서 `foo()`를 호출했고 새로 생성된 객체는 `foo`호출 시 `this에 바인딩 된다.` 따라서 **결국 `new`는 함수 호출 시 `this`를 새 객체와 바인딩 하는 방법이며, 이것이 new 바인딩이다.**


## 3. 모든 건 순서가 있는 법

여기부터 해야함. p.52