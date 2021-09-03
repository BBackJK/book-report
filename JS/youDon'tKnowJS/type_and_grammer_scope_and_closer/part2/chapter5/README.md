# 스코프 클로저

## 1. 핵심

**클로저는 함수가 속한 렉시컬 스코프를 기억하여 함수가 렉시컬 스코프 밖에서 실행될 때에도 이 스코프에 접근할 수 있게 하는 기능.**

```js
function foo() {
  var a = 2;
  function bar() {
    console.log(a);   // 2
  }
  bar();
}
foo();
```

함수 `bar()`는 `foo()` 스코프에 대한 클로저를 가진다.

달리 말하면, `bar()`는 `foo()` 스코프에서 닫힌다.

`bar()`는 중첩되어 `foo()`안에 존재하기 때문이다.

다음 코드를 보자.

```js
function foo() {
  var a = 2;
  function bar() {
    console.log(a);
  }
  return bar;
}

var baz = foo();

baz();  // 2
```

함수 `bar()`는 `foo()`의 렉시컬 스코프에 접근할 수 있고, `bar()`함수 자체를 값으로 넘긴다. 위의 코드는 `bar`를 참조하는 함수 객체 자체를 반환한다.

`foo()`를 실행하여 반환한 값(`bar() 함수`)을 `baz`라 불리는 변수에 대입하고 실제로는 `baz()` 함수를 호출했다. 이는 당연하게도 그저 다른 확인자 참조로 내부 함수인 `bar()`를 호출한 것이다.

`bar()`는 의심할 여지없이 실행됐다. 그러나 이 경우에 함수 `bar`는 함수가 선언된 렉시컬 스코프 밖에서 실행됐다.

일반적으로 `foo()`가 실행된 후에는 `foo()`의 내부 스코프가 사라졌다고 생각할 것이다. 이 것은 엔진이 **가비지 콜렉터**를 고용해 더는 사용하지 않는 메모리를 해제시킨다는 사실을 알기 때문이다. 더는 `foo()`의 내용을 사용하지 않는 상황이라면 사라졌다고 보는게 맞다.

하지만 클로저는 다르다.

사실 `foo()`의 내부 스코프는 여전히 *사용 중* 이므로 해제되지 않는다. 그럼 누가 그 스코프를 사용할까? 바로 `bar()` 이다. 선언된 위치 덕에 `bar()`는 `foo()` 스코프에 대한 렉시컬 스코프 클로저를 가지고, `foo()`는 `bar()`가 나중에 참조할 수 있도록 스코프를 살려둔다. 즉, `bar()`는 여전히 해당 스코프에 대한 참조를 가지는데, 그 참조를 **클로저**라고 한다.

```js
function foo() {
  var a = 2;
  function baz() {
    console.log(a);
  }
  bar(baz);
}

function bar(fn) {
  fn();   // look ma, I saw closure
}
```

## 2. 이제 나는 볼 수 있다.

앞에서 본 코드들은 클로저 사용법을 보여주기 위해 다소 학술적이고 인위적으로 작성했다.

클로저는 모든 코드 안에 존재하는 무언가라고 생각한다.

다음을 보자.

```js
function wait(message) {
  setTimeout(function timer() {
    console.log(message);
  }, 1000);
}

wait("Hello, closure!");
```

내부 함수 `timer`를 `setTimeout()`에 인자로 넘겼다.

`timer()` 함수는 `wait()` 함수의 스코프에 대한 스코프 클로저를 가지고 있으므로 변수 `message`에 대한 참조를 유지하고 사용할 수 있다.

`wait()` 실행 1초 후, `wait`의 내부 스코프는 사라져야 하지만 익명의 함수가 여전히 해당 스코프에 대한 클로저를 가지고 있다.

엔진 내부 깊숙한 곳의 내장 함수 `setTimeout()`에는 아마도 `fn`이나 `func` 정도로 불릴 인자의 참조가 존재한다. 엔진은 해당 함수 참조를 호출하여 내장 함수 `timer`를 호출하므로 `timer`의 렉시컬 스코프는 여전히 온전하게 남아 있다.

## 3. 반복문과 클로저

클로저를 설명하는 가장 흔하고 표준적인 사례는 역시 `for`문이다.

```js
for (var i=1; i <= 5; i++) {
  setTimeout(function timer() {
    console.log(i);
  }, i*1000);
}
```

> 자바스크립트 코드 스타일러인 린터는 반복문 안에 함수를 넣는 것을 경고한다. 이렇게 설정한 이유는 개발자들이 클로저를 자주 사용한다고 생각하지 않기 때문이다.

이 코드의 목적은 예상대로 '1', '2', ... , '5'까지 한 번에 하나씩 일 초마다 출력하는 것이다. 그러나 실제로 코드를 돌려보면, 일 초마다 한 번씩 '6'만 5번 출력된다.

다시 한번 보자.

반복문이 끝나는 조건은 `i`가 `<=5`가 아닐 때이다.

처음으로 끝나는 조건이 갖춰졌을 때 `i`의 값은 6이다. 즉, 출력된 값은 반복문이 끝났을 때의 `i` 값을 반영한 것이다.

`timeout` 함수 콜백은 반복문이 끝나고 나서야 작동한다. 사실, 타이머를 차지하고 반복마다 실행된 것이 `setTimeout(..., 0)`이었다 해도 해당 함수 콜백은 확실히 반복문이 끝나고 나면 동작해서 결과로 매번 6을 출력한다.

그렇다면 애초에 문법적으로 기대한 것과 같이 이 코드를 작동시키려면 어떻게 해야할까?

그러기 위해서는 반복마다 각각의 `i`의 복제본을 **잡아두는 것**이다. 그러나 반복문 안 총 5개의 함수들은 반복마다 따로 정의됐음에도 모두 같이 글로벌 스코프 클로저를 공유해 해당 스코프 안에는 오직 하나의 `i`만이 존재한다. 따라서 모든 함수는 당연하게도 같은 `i`에 대한 참조를 공유한다.

```js
for (var i=1;i<=5;i++) {
  (function() {
    setTimeout(function timer() {
      console.log(i);
    }, i*1000);
  })();
}
```

`i`를 잡아두려고 `IIFE`를 사용했지만 결과적으로는 작동하지 않는다. 

각각의 `setTimeout()` 함수 콜백은 확실히 반복마다 각각의 `IIFE`가 생성한 자신만의 스코프를 가진다. 그러나 닫힌 스코프만으로는 부족하다. 이 스코프가 비어있기 때문이다.

`IIFE`는 아무것도 하지 않는 빈 스코프일 뿐이니 무언가 해야 한다. 각 스코프는 자체 변수가 필요하다. 즉, 반복마다 `i`의 값을 저장할 변수가 필요하다.

```js
for (var i=1; i<=5; i++) {
  (function() {
    var j = i;
    setTimeout(function timer() {
      console.log(j);
    }, j*1000);
  })();
}
```

### 3.1 다시 보는 블록 스코프

위에 코드를 다른 방법으로 해결해보자.

실제 필요한 것은 반복 별 블록 스코프이다.

```js
for (var i=1; i<= 5; i++) {
  let j = i;    // yay, block-scope for closure!
  setTimeout(function timer() {
    console.log(j);
  }, j*1000);
}
```

변수 선언자 `var` 대신 `let`을 사용하여 스코프를 묶어두었다.

그렇다면 다음과 같이도 사용이 가능하다.

```js
for(let i=1; i<=5; i++) {
  setTimeout(function timer() {
    console.log(i);
  }, i*1000);
}
```

## 4. 모듈

클로저의 능력을 활용하면서 표면적으로는 콜백과 상관없는 코드 패턴들이 있다. 그 중 가장 강력한 패턴인 모듈을 보자.

```js
function foo() {
  var something = "cool";
  var another = [1, 2, 3];

  function doSomething() {
    console.log(something);
  }

  function doAnother() {
    console.log(another.join("!"));
  }
}
```

이 코드에는 클로저의 흔적이 보이질 않는다.

```js
function CoolModule() {
  var something = "cool";
  var another = [1, 2, 3];

  function doSomething() {
    console.log(something);
  }

  function doAnother() {
    console.log(another.join("!"));
  }

  return {
    doSomething: doSomething,
    doAnother: doAnother
  };
}

var foo = CoolModule();

foo.doSomething();    // cool
foo.doAnother();      // 1 ! 2 ! 3
```

이러한 코드와 같은 자바스크립트 패턴을 **모듈**이라고 부른다. 가장 흔한 모듈 패턴 구현 방법은 **모듈 노출**이고, 앞의 코드는 이 **모듈 노출**의 변형이다.

먼저, 앞의 코드에서 몇 가지를 살펴보자.

1. `CoolModule()`은 그저 하나의 함수일 뿐이지만, 모듈 인스턴스를 생성하려면 반드시 호출해야 한다. 최외곽 함수가 실행되지 않으면 내부 스코프와 클로저는 생성되지 않는다.

2. `CoolModule()` 함수는 객체를 반환한다. 반환되는 객체는 객체-리터럴 문법 `{ key: value, ...}`에 따라 표기된다. 해당 객체는 내장 함수들에 대한 참조를 가지지만, 내장 데이터 변수에 대한 참조는 가지지 않는다. 내장 데이터 변수는 비공개로 숨겨져 있다. 이 객체의 반환 값은 본질적으로 모듈의 공개 API라고 생각할 수 있다.

객체의 반환 값은 최종적으로는 외부 변수 `foo`에 대입되고, `foo.doSomething()`과 같은 방식으로 API의 속성 메소드에 접근할 수 있다.

함수 `doSomething()`과 `doAnother()`는 모듈 인스턴스의 내부 스코프에 포함하는 클로저를 가진다. 반환된 객체에 대한 속성 참조 방식으로 이 함수들을 해당 렉시컬 스코프 밖으로 옮길 때 클로저를 확인하고 이용할 수 있는 조건을 하나 세웠다.

쉽게 말해, 이 패턴을 사용하려면 두 가지 조건이 있다.

1. 하나의 최외곽 함수가 존재하고, 이 함수가 최소 한번은 호출되어야 한다. (호출될 때마다 새로운 인스턴스가 생성된다.)
2. 최와곽 함수는 최소 한 번은 하나의 내부 함수를 반환해야 한다. 그래야 해당 내부 함수가 비공개 스코프에 대한 클로저를 가져 비공개 상태에 접근하고 수정한다.


위의 코드는 독립된 모듈 생성자 `CoolModule()`을 가지고, 생성자는 몇 번이든 호출할 수 있고 호출할 때마다 새로운 모듈 인스턴스를 생성한다. 이 패턴에서 약간 변경된 오직 하나의 인스턴스, '싱글톤'만 생성하는 모듈을 살펴보자.

```js
var foo = (function() CoolModule() {
  var something = "cool";
  var another = [1, 2, 3];

  function doSomething() {
    console.log(something);
  }

  function doAnother() {
    console.log(another.join("!"));
  }

  return {
    doSomething: doSomething,
    doAnother: doAnother
  };
})();

foo.doSomething();    // cool
foo.doAnother();      // 1 ! 2 ! 3
```

### 4.1 현재의 모듈

많은 모듈 의존성 로더와 관리자는 본질적으로 이 패턴의 모듈 정의를 친숙한 API 형태로 감싸고 있다. 특정한 하나의 라이브러리를 살펴보다기보다는 개념을 설명하기 위해 매우 단순한 증명을 제시하겠다.

```js
var MyModules = (function Manager() {
  var modules = {};

  function define(name, deps, impl) {
    for (var i = 0; i < deps.length; i++) {
      deps[i] = modules[deps[i]];
    }
    modules[name] = impl.apply(impl, deps);
  }

  function get(name) {
    return modules[name];
  }

  return {
    define: define,
    get: get
  };
})();
```

이 코드의 핵심부는 `modules[name] = impl.apply(impl, deps)`다. 이 부분은 (의존성을 인자로 넘겨) 모듈에 대한 정의 래퍼 함수를 호출하여 반환 값인 모듈 API를 이름으로 정리된 내부 모듈 리스트에 저장한다.

해당 부분`(modules[name] = impl.apply(impl, deps))`을 이용해 모듈을 정의하는 다음 코드를 보자.

```js
MyModules.define("bar", [], function() {
  function hello(who) {
    return "Let me introduce: " + who;
  }

  return {
    hello: hello
  };
});

MyModules.define("foo", ["bar"], function(bar) {
  var hungry = "hippo";
  function awesome() {
    console.log(bar.hello(hungry).toUpperCase());
  }

  return {
    awesome: awesome
  };
});

var bar = MyModules.get("bar");
var foo = MyModules.get("foo");

console.log(
  bar.hello("hippo")
);    // let me introduce: hippo

foo.awesome();  // LET ME INTRODUCE: HIPPO
```

### 5.2 미래의 모듈

ES6는 모듈 개념을 지원하는 최신 문법을 추가했다.

모듈 시스템을 불러올 때 ES6는 파일을 개별 모듈로 처리한다.

```js
// bar.js
function hello(who) {
  return "Let me introduce: " + who;
}

export hello;


=====================================================================================
// foo.js ; import only `hello()` from the "bar" module
import hello from 'bar';

var hungry = "hippo";

function awesome() {
  console.log(hello(hungry).toUpperCase());
}

export awesome;

================================================================================
// baz.js : import the entire "foo" and "bar" modules
module foo from 'foo';
module bar from 'bar';

console.log(bar.hello("rhino"));    // Let me introduce: rhino

foo.awesome();    // LET ME INTRODUCE: HIPPO
```


