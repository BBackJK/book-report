# 네이티브

가장 많이 쓰이는 네이티브

* String()
* Number()
* Boolean()
* Array()
* Object()
* Function()
* RegExp()
* Date()
* Error()
* Symbol()

사실 내장 함수.

> 네이티브란, 특정 환경(브라우저 등의 클라이언트 프로그램)에 종속되지 않은, ECMA Script 명세의 내장 객체를 말한다. 

네이티브는 생성자처럼 사용할 수 있지만 실제로 생성되는 결과물은 예상과는 다를 수 있다.

```js
var a = new String("abc");

typeof a;     // "object"  --> "String"이 아니다.

a instanceof String;  // true

Object.prototype.toString.call(a);  // "[object String]"
```

``new String(abc)`` 생성자의 결과는 원시 값 "abc"를 감싼(wrapper) 객체 래퍼다.



## 1. 내부 ``[[Class]]``


typeof가 'object'인 값(배열 등)에서는 ``[[Class]]``라는 내부 프로퍼티가 추가로 붙는다.

이 프로퍼티는 직접 접근할 수 없고, ``Object.prototype.toString()``라는 메소드에 값을 넣어 호출함으로써 존재를 엿볼 수 있다. 

```js
Object.prototype.toString.call( [1, 2, 3] );  // "[object Array]"

Object.prototype.toString.call( /regex-literal/i );   // "[object RegExp]"
```

## 2. 네이티브, 나는 생성자다
### 2.1 Object(), Function(), and RegExp()

위에 3가지 네이티브 생성자는 어떤 의도가 있지 않는 한 사용하지 않는 것이 좋다.

```js
var c = new Object();
c.foo = "bar";

c;  // { foo: "bar" }

var d = { foo: "bar" }
d;  // { foo: "bar" }

var e = new Function("a", "return a * 2;");
var f = function(a) { return a * 2;}
function g(a) { return a * 2 };

var h = new RegExp("a*b+", "g");
var i = /^a*b+/g;
```

정규표현식은 리터럴형식 (i와 같은) 으로 정의할 것을 적극 추천한다.

성능상 이점 (**자바스크립트 엔진이 실행 전 정규 표현식을 미리 컴파일한 후 캐시한다**)이 있다.

하지만 정규표현식이 정적이 아닌 동적으로 사용하고 싶다면 네이티브 생성자를 사용해야한다.

```js
var name = "Kyle";
var namePattern = new RegExp("\\b(?:" + name + ")+\\b", "ig");

var matches = someText.match(namePattern);
```
