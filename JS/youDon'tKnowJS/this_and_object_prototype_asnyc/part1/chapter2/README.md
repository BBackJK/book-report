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

위에서 4가지의 `this` 바인딩 방법을 알아보았다.

이러한 4가지의 바인딩 방법에도 적용되는 순서가 다르다.

기본적인 바인딩은 가장 뒷순위이고, 암시적 바인딩과 명시적 바인딩.. 어떤 바인딩이 먼저 적용될까?

```js
function foo() {
  console.log(this.a);
}

var obj1 = {
  a: 2,
  foo: foo
};

var obj2 = {
  a: 3,
  foo: foo
};

obj1.foo(); // 2
obj2.foo(); // 3

obj1.foo().call(obj2);  // 3
obj2.foo().call(obj1);  // 2
```

결과를 보면 명시적 바인딩이 암시적 바인딩보다 우선순위가 높음을 알 수 있다.

그렇다면 남은 new 바인딩을 살펴보자.

```js
function foo(something) {
  this.a = something;
}

var obj1 = {
  foo: foo
};

var obj2 = {};

obj1.foo(2);
console.log(obj1.a);  // 2

obj1.foo.call(obj2, 3);
console.log(obj2.a);  // 3

var bar = new obj1.foo(4);

console.log(obj1.a);  // 2
console.log(bar.a);   // 4
```

new 바인딩이 암시적 바인딩보다 우선순위가 높다. 그럼 new 바인딩과 명시적 바인딩 중 어느 쪽이 우선순위가 있을까?

> `new`와 `call`, `apply`는 동시에 사용할 수 없으므로 `new foo(obj1)`같이 `new` 바인딩과 명시적 바인딩을 곧바로 비교할 수 없다. 하지만 하드 바인딩을 이용하면 두 규칙 간 우선순위를 테스트할 수 있다.


자, 그럼 하드 바인딩의 물리적인 작동 원리를 살펴보자. `Function.prototype.bind()`는 어떤 종류든 자체 `this` 바인딩을 무시하고 주어진 바인딩을 적용하여 하드 코딩된 새 래퍼 함수를 생성한다.

따라서 명시적 바인딩의 한 형태인 하드 코딩이 `new` 바인딩 보다 우선순위가 높고 `new`로 오버라이드할 수 없다는 사실을 짐작할 수 있다. 직접 확인해보자.

```js
function foo(something) {
  this.a = something;
}

var obj1 = {};

var bar = foo.bind(obj1);
bar(2);
console.log(obj1.a);  // 2

var baz = new bar(3);
console.log(obj1.a);  // 2
console.log(baz.a);   // 3
```

`bar`는 `obj1`에 하드 바인딩 됐는데, 짐작대로 `new bar(3)` 실행 후에도 `obj1.a` 값은 3으로 바뀌지 않고, 그 대신 `obj1`에 하드 바인딩 된 `bar()` 호출은 `new`로 오버라이드 할 수 있다. 또한 `new`가 적용되므로 새로 만들어진 객체가 `baz`에 할당되고 실제 `baz.a`의 값은 3이 된다.

진짜 `Function.prototype.bind()` 함수는 실제로 이보다는 정교하게 구현되어 있다. 다음은 MDN 사이트에서 발췌하여 약간 형태를 다듬은 `bind()`의 폴리필이다.

```js
if (!Function.prototype.bind) {
  Function.prototype.bind = function(oThis) {
    if (typeof this !== "function") {
      throw new TypeError("Function.prototype.bind - 바인딩 하려는 대상이 호출 가능하지 않습니다.");
    }

    var aArgs = Array.prototype.slice.call(arguments, 1),
      fToBind = this,
      fNOP = function() {},
      fBound = function() {
        return fToBind.apply(
          (this instanceof fNOP && oThis ? this : oThis),
          aArgs.concat(Array.prototype.slice.call(arguments));
        )
      };

      fNOP.prototype = this.prototype;
      fBound.prototype = new fNOP();

      return fBound;
  }
}
```

new 오버라이드를 가능케하는 코드는 다음 부분이다.

```js
this instanceof fNOP && oThis ? this : oThis

// 중략

fNOP.prototype = this.prototype;
fBound.prototype = new fNOP();
```

이런 기법이 어떻게 작동하는지 상세하게 다루지는 않지만 기본 로직은 하드 바인딩 함수가 `new`로 호출되어 `this`가 새로 생성된 객체로 세팅됐는지 조사해보고 맞으면 하드 바인딩에 의한 `this`를 버리고 새로 생성된 `this`를 대신 사용한다.

굳이 `new`로 하드 바인딩을 오버라이드하려는 이유는 뭘까? 기본적으로 `this` 하드 바인딩을 무시하는 (new로 객체를 생성할 수 있는) 함수를 생성하여 함수 인자를 전부 또는 일부만 미리 세팅할 때 유용하다. `bind()`함수는 최초 `this` 바인딩 이후 전달된 인자를 원 함수의 기본 인자로 고정하는 역할을 한다.

> 기술적으로는 `부분 적용`이라고 하는데 이는 `커링`의 일종이다.

다음 코드를 참조하자.

```js
function foo(p1, p2) {
  this.val = p1 + p2;
}

// null을 입력한 건 this 하드 바인딩은
// 어차피 new 호출 시 오버라이드 되므로 신경쓰지 않겠다는 의미이다.
var bar = foo.bind(null, "p1");

var baz = new bar("p2");

baz.val;  // p1p2;
```

### 3.1 this 확정 규칙

이제 함수 호출부에서 `this`가 결정되는 규칙을 우선순위에 따라 차례대로 정리해보자.

1. new로 함수를 호출(new 바인딩) 했는가? -> 맞으면 새로 생성된 객체가 this다.

```js
var bar = new foo();
```

2. call과 apply로 함수를 호출(명시적 바인딩), 이를테면 bind 하드 바인딩 내부에 숨겨진 형태로 호출했는가? -> 맞으면 명시적으로 지정된 개체가 this다.

```js
var bar = foo.call(obj2);
```

3. 함수를 콘텍스트(암시적 바인딩), 즉 객체를 소유 또는 포함하는 형태로 호출했는가? -> 맞으면 바로 이 콘텍스트가 this다.

```js
var bar = obj1.foo();
```

4. 그 외의 경우에 this는 기본값(엄격 모드는 undefined, 비엄격 모드는 전역 객체)으로 세팅된다.(기본 바인딩)

```js
var bar = foo();
```

## 4. 바인딩 예외

항상 그렇듯 모든 규칙엔 예외가 존재한다.

### 4.1 this 무시

`call`, `apply`, `bind` 메소드에 첫 번째 인자로 `null` 또는 `undefined`를 넘기면 `this` 바인딩이 무시되고 기본 바인딩 규칙이 적용된다.

```js
function foo() {
  console.log(this.a);
}

var a = 2;
foo.call(null); // 2
```

그렇다면 왜 `null`같은 값으로 `this` 바인딩을 하려는걸까? `apply()`는 함수 호출 시 다수의 인자를 배열 값으로 죽 펼쳐 보내는 용도로 자주 쓰인다. `bind()`도 유사한 방법으로 인자들(미리 세팅된 값들)을 커링하는 메소드로 많이 사용한다.

```js
function foo(a, b) {
  console.log("a: " + a + ", b: " + b);
}

// 인자들을 배열 형태로 쭉 펼친다.
foo.apply(null, [2, 3]);  // a: 2, b: 3

// `bind()`로 커링한다.
var bar = foo.bind(null, 2);
bar(3); // a: 2, b: 3
```

`apply`와 `bind` 모두 반드시 첫 번째 인자로 `this` 바인딩을 지정해야 한다. 하지만 `this`가 로직상 아무래도 좋다면 일종의 자리 끼움값으로 `null` 정도의 값을 전달하는 편이 합리적이다.

> 이 책에서는 다루지 않지만 ES6에서부터 spread 연산자 (...)가 생겨서 this 바인딩이 필요 없으면 아예 구문에서 빼버리고 `apply()` 없이 인자를 배열 형태로 펼칠 수 있다. `foo(...[1, 2])`는 `foo(1, 2)`와 같다. 그런데 커링은 새 연산자가 따로 정해지지 않아서 `bind()` 호출은 잘 봐둘 필요가 있다.

그러나 `this` 바인딩이 어찌 되든 상관없다고 `null`을 애용하는 건 약간의 리스크가 존재한다.

어떤 함수을 호출 시 null을 전달했는데, 마침 그 함수가 내부적으로 `this`를 레퍼런스로 참조하면 기본 바인딩이 적용되어 전역 변수를 참조하거나 최악으로는 변경하는 예기치 못한 상황이 발생할 수 있다. 이러한 돌발 상황은 추적하여 솎아내기 어려운 다양한 버그를 야기한다.

#### 더 안전한 this

더 안전하게 가고자 한다면 프로그램에서 부작용과 100% 무관한 객체를 `this`로 바인딩 하는 것이 좋다. 네트워크 업계의 용어로 표현하면 일종의 **'DMZ' 객체**, **즉 내용이 하나도 없으면서 전혀 위임되지 않은 객체 정도가 필요하다.**

`this` 바인딩을 신경 쓰지 않고 싶을 때마다 이 `DMZ` 객체를 전달하면, 받는 쪽에서 `this`를 어찌 사용하든지 어차피 대상은 빈 객체로 한정되므로 최소한 전역 객체를 건드리는 부작용은 방지할 수 있다.

필자는 개인적으로 100% 빈 객체를 ø리는 변수명으로 즐겨 사용한다.

> 맥북 기준으로 영어입력 -> [option] + [o]

빈 객체를 만드는 가장 간단한 방법은 `Object.create(null)`이다. `Object.create(null)`은 `{}`와 비슷하나 `Object.prototype`으로 위임하지 않으므로 `{}`보다 더 텅 빈 객체라고 볼 수 있다.

```js
function foo(a, b) {
  console.log("a: " + a + ", b: " + b);
}

// DMZ 객체 생성
var ø = Object.create(null);

// 인자들을 배열 형태로 죽 펼친다.
foo.apply(ø, [2, 3]); // a: 2, b: 3

// 'bind()'로 커링한다.
var bar = foo.bind(ø, 2);
bar(3); // a: 2, b: 3
```

기능적으로 `더 안전하다`는 의미 외에도 `ø` 처럼 표기하면 `this는 텅 빈 객체로 하겠다`는 의도를 `null`보다 더 확실하게 밝히는 효과가 있다.

### 4.2 간접 레퍼런스

의도적이든 아니든 한 가지 더 유의할 점은 **간접 레퍼런스**가 생성되는 경우로, 함수를 호출하면 무조건 기본 바인딩 규칙이 적용되어 버린다. 간접 레퍼런스는 할당문에서 가장 빈번하게 발생한다.

```js
function foo() {
  console.log(this.a);
}

var a = 2;
var o = { a: 3, foo: foo };
var p = { a: 4 };

o.foo();  // 3
(p.foo = o.foo)();  // 2
```

할당 표현식 `p.foo = o.foo`의 결괏값은 원 함수 객체의 레퍼런스 이므로 실제로 호출부는 처음 예상과는 달리 `p.foo()`, `o.foo()`가 아니고 `foo()`다. 그래서 기본 바인딩 규칙이 적용된다.

**어떤 경위로 기본 바인딩 규칙이 적용된 함수 호출을 하게 됐든지 호출부가 아닌 호출된 함수 본문의 엄격 모드 여부에 따라 기본 바인딩 값이 달라진다는 사실을 꼭 기억하자.**

### 4.3 소프트 바인딩

함수 호출 시 애초 의도와는 다르게 기본 바인딩 규칙이 적용되는 걸 막기 위해 `this`를 강제하는 하드 바인딩 기법은 앞에서 이미 언급했었다. 그런데 문제는 하드 바인딩은 함수의 유연성을 크게 떨어뜨리기 때문에 `this`를 암시적 바인딩 하거나 나중에 다시 명시적 바인딩 하는 식으로 수동으로 오버라이드 하는 것이 불가능 하다.

암시적/명시적 바인딩 기법을 통해 임의로 `this` 바인딩을 하는 동시에 전역 객체나 `undefined`가 아닌 다른 기본 바인딩 값을 세팅할 수 있다면 바랄 것이 없을 것 같다.

그래서 사람들이 이른바 **소프트 바인딩**이라는 유틸리티를 고안했다.

```js
if (!Function.prototype.softBind) {
  Function.prototype.softBind = function(obj) {
    var fn = this;

    // 커링된 인자는 죄다 포착한다.
    var curried = [].slice.call(arguments, 1);
    var bound = function() {
      return fn.apply(
        (!this || this === (window || global)) ? obj: this.curried.concat.apply(curried, arguments);
      );
    };

    bound.prototype = Object.create(fn.prototype);
    return bound;
  }
}
```

`softBind()` 유틸리티는 소프트 바인딩 로직을 제외하면 ES5의 `bind()` 유틸리티와 매우 비슷하다. 호출 시점에 `this`를 체크하는 부분에서 주어진 함수를 래핑하여 전역 객체나 `undefined`일 경우엔 미리 준비한 기본 객체(obj)로 셋팅한다. 그 외의 경우 `this`는 손대지 않는다. 그리고 선택적인 커링기능도 있다.

```js
function foo() {
  console.log("name: " + name);
}

var obj = { name: 'obj' };
var obj2 = { name: 'obj2' };
var obj3 = { name: 'obj3' };

var fooOBJ = foo.softBind(obj);
fooOBJ(); // name : obj

obj2.foo = foo.softBind(obj);
obj2.foo(); // name : obj2

fooOBJ.call(obj3);  // name : obj3

setTimeout(obj2.foo, 10;)
// name: obj
```

소프트 바인딩이 탑재된 `foo()` 함수는 `this`를 `obj2`나 `obj3`으로 수동 바인딩 할 수 있고, 기본 바인딩 규칙이 적용되어야 할땐, 다시 `obj`를 되돌린다.

## 5. 어휘적 this

화살표 함수는 `function` 이라는 키워드 대신 뚱뚱한 화살표 연산자로 불리는 `=>`를 써서 표현한다.

이 화살표 함수는 위에서 봤던 4가지 표준 규칙 대신 에두른 스코프(함수 또는 전역; Enclosing Scope)를 보고 `this`를 알아서 바인딩 한다.

다음은 화살표 함수의 렉시컬 스코프를 나타낸 예제이다.

```js
function foo() {
  // 화살표 함수는 반환한다.
  return (a) => {
    // 여기서 'this'는 어휘적으로 'foo()'에서 상속된다.
    console.log(this.a)
  };
}

var obj1 = {
  a: 2
};

var obj2 = {
  a: 3
};

var bar = foo.call(obj1);
bar.call(obj2); // 2 --> 3이 아니다!
```

`foo()` 내부에서 생성된 화살표 함수는 `foo()` 호출 당시 `this`를 무조건 어휘적으로 포착한다. `foo()`는 `obj1`에 `this`가 바인딩 되므로 `bar(반환된 화살표 함수를 가르키는 변수)`의 `this` 역시 `obj1`로 바인딩 된다.

**화살표 함수의 어휘적 바인딩은 절대로 오버라이드할 수 없다.**

화살표 함수는 이벤트 처리기나 타이머 등의 콜백에 가장 널리 쓰인다.

```js
function foo() {
  setTimeout(() => {
    // 여기서 'this'는 어휘적으로 'foo()'에서 상속된다.
    console.log(this.a);
  }, 100);
}

var obj = {
  a: 2
};

foo.call(obj);  // 2
```

화살표 함수는 `this`를 확실히 보장하는 수단으로 `bind()`를 대체할 수 있고, 겉보기에도 끌리는 구석이 있지만, 결과적으로 더 잘 알려진 렉시컬 스코프를 쓰겠다고 기존의 `this` 체계를 포기하는 형국이란 점을 간과하면 안된다.

화살표 함수가 나오기 전에는 다음과 같이 사용했었다.

```js
function foo() {
  var self = this;

  setTimeout(function() {
    console.log(self.a);
  }, 100);
}

var obj = {
  a: 2
};

foo.call(obj);  // 2
```

`self = this`나 화살표 함수 모두 `bind()` 대신 사용 가능한 좋은 해결책이지만 `this`를 제대로 이해하고 수용하기 보단 골치 아픈 `this`에서 도망치려는 꼼수라고 할 수 있다.

어쨋든, `this` 스타일의 코드를 작성해야 할 경우 어휘적 `self = this`던지 화살표 함수 던지 꼭 다음 두 가지중 하나만 선택하자.

1. 오직 렉시컬 스코프만 사용하고 가식적인 `this` 스타일의 코드는 접어둔다.
2. 필요하면 `bind()` 까지 포함하여 완전한 `this` 스타일의 코드를 구사하되, `self = this` 나 화살표 함수 같은 소위 **어휘적 this** 꼼수는 삼가야 한다.
3. 두 스타일 모두 적절히 혼용하여 효율적인 프로그래밍을 할 수도 있겠지만 동일 함수 내에서 똑같은 것을 찾는데 서로 다른 스타일이 섞여 있으면 관리도 잘 안되고 개발자가 천재가 아닌 이상 이해하기 곤란한 골칫덩이 코드로 남게 될 것이다.

