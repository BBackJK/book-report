# 타입

## 1. 내장 타입

자바스크립트에는 7가지의 내장 타입( = 원시타입)이 존재

1. null
2. undefined
3. boolean
4. number
5. string
6. object
7. symbol

* 여기서 주의해야할 것은 **null**

```js
typeof null === "object"; // true
```

null은 falsy한 유일한 원시 값이지만, 타입은 'object'인 특별한 존재로써, 잘못 사용하다가 버그가 나기 쉽다.

따라서 null 값을 정확히 확인하려면

다음과 같이 해야한다.

```js
var a = null;
(!a && typeof a === "object");  // true
```


* function

typeof가 반환하는 문자열은 **function**라는 것이 하나 더 있다.

```js
typeof function a() { /** **/ } === 'function'  // true
```

이렇게 따져보면 function 또한 내장 타입처럼 보일 수 있으나 실제로는 object의 **하위 타입**이다.

> 구체적으로 설명하자면 **호출 가능한 객체** 라고 명시되어있다.

<br/>

## 2. 값은 타입을 가진다.

값에는 타입이 있지만, 변수엔 따로 타입이 없다.

변수는 언제라도, 어떤 형태의 값이라도 가질 수 있다.


### 2.1 값이 없는 vs 선언되지 않은

값이 없는 변수의 값은 `undefined`이며, typeof 결과는 "undefined"이다.

```js
var a;

typeof a; // "undfined"

var b = 42;
var c;

b = c;

typeof b; // "undefined"
typeof c; // "undefined"
```

"undefined"(값이 없는)와 "undeclared"(선언되지 않은)를 동의어처럼 생각하기 쉽지만, 자바스크립트에서 둘은 **완전히 다른 개념**.

* undefined
**접근 가능**한 스코프에 변수가 선언되었으나 현재 아무런 값이 할당되지 않은 상태.

* undeclared
**접근 가능**한 스코프에 변수 자체가 선언조차 되어있지 않은 상태.

```js
var a;

a;    // undefined
b;    // ReferenceError: b가 할당되지 않았습니다.
```

주의할 것으로는 undeclared 변수의 typeof 연산 결과는 더 헷갈리게 만든다.

```js
var a;
typeof a; // "undefined"
typeof b; // "undefined"
```

이 때 알 수 있는 것이 바로 typeof는 undeclared인 값을 오류 처리를 하지 않는다는 점이다. --> safe guard

### 2.2 선언되지 않은 변수

프로그램의 `디버그 모드`를 DEBUG라는 전역변수(플래그)로 조정한다고 하였을 경우

콘솔 창에 메시지 로깅 등 디버깅 작업을 수행하기 전, 이 변수의 선언 여부를 체크해야할 것이다.

최상위 전역 스코프에 var DEBUG = true 라고 'debug.js'파일에만 선언하고, 개발/테스트 단계(DEBUG 모드이므로 운영단계에는 제외)에서 이 파일을 브라우저가 로딩하기만 하면 될 것이다.

그러나 나머지 애플리케이션 코드에서 ReferenceError가 나지 않게 하려면 조심해서 DEBUG 전역 변수를 체크해야 한다.

바로 이럴 때, typeof의 safe guard를 사용하면 안전하게 처리할 수 있다

```js
// 에러를 유발하는 코드
if (DEBUG) {
  console.log('디버깅을 시작합니다.');
}

// 안전하게 존재 여부를 체크할 수 있는 코드
if (typeof DEBUG !== "undefined") {
  console.log('디버깅을 시작합니다.');
}
```

이렇게 하면 (DEBUG와 같은) 임의로 정의한 변수를 쓰지 않더라도 에러가 나지 않게 할 수 있다.

```js
if (typeof atob === 'undefined') {
  atob = function() { /** **/ };
}
```

> 존재하지 않는 기능을 추가하기 위해 '폴리필'을 정의하려면 atob 선언문에서 var 키워드를 빼는 편이 좋다. if 문 블록에 var atob로 선언하면, 코드 실행을 건너뛰더라도 선언 자체가 최상위 스코프로 호이스팅 된다. 이렇게 특수한 타입의 전역 내장 변수를 중복 선언하면 에러를 던지는 브라우저가 있다. 즉, 명시적으로 var를 빼야 선언문이 호이스팅 되지 않는다.

typeof 안전 가드 없이 전역 변수를 체크하는 다른 방법은 **전역 변수가 모두 전역 객체(브라우저의 window)의 프로퍼티라는 점을 이용하는 것이다.**

그래서 다음과 같이도 안전하게 체크할 수 있다.

```js
if (window.DEBUG) {
  /** ... **/
}

if (!window.atob) {
  /** ... **/
}
```

선언되지 않은 변수 때와는 달리 어떤 객체(전역 window 객체도 포함해서)의 프로퍼티를 접근할 때 그 프로퍼티가 존재하지 않아도 ReferenceError가 나지 않는다.

typeof 안전 가드(safe guard)는 전역 변수를 사용하지 않을 때에도 유용한데, 일부 개발자들은 이런 설계 방식이 그다지 바람직하지 않다고 말한다. 이를테면 다른 개발자가 여러분이 작성한 유틸리티 함수를 자신의 모듈/프로그램에 복붙하여 사용하는데, 가져다 쓰는 프로그램에 유틸리티의 특정 변수값이 정의되어 있는지 체크해야 하는 상황을 보자.

```js
function doSomethingCool() {

  var helper = (typeof FeatureXYZ !== "undefined") ? FeatureXYZ : function() { /** 기본 XYZ 기능 **/}

  var val = helper();

  // ...
}
```

``doSomethingCool`` 함수는 ``FeatureXYZ`` 변수가 있으면 그대로 사용하고 없으면 함수 바디를 정의한다. 이렇게 해야 다른 사람이 나의 코드를 사용하였을 경우 안전하게 ``FeatureXYZ``가 존재하는지 체크할 수 있다.

```js
// IIFE (즉시 호출 함수 표현식)
(function() {
  function FeatureXYZ() { /** 나의 XYZ 기능 **/ }

  // 'doSomethingCool()'를 포함
  function doSomethingCool() {
    var helper = (typeof FeatureXYZ !== "undefined") ? FeatureXYZ : function() {/** 기본 XYZ 기능 **/};

    var val = helper();
    // ...
  }

  doSomethingCool();
})();
```

여기서 ``FeatureXYZ``는 전역 변수는 아니지만, typeof 안전 가드를 이용하여 안전하게 체크하고 있다.

그리고 이 코드에선 체크 용도로 사용할 만한 객체가 없기 때문에 typeof가 꽤 요긴하긴 하다.

**의존성 주입 설계 패턴을 선호하는 개발자들도 있다.**

 ``FeatureXYZ``가 ``doSomethingCool()``의 바깥이나 언저리에 정의되었는지 암시적으로 조사하는 대신, 다음 코드처럼 명시적으로 의존 관계를 전달하는 것이다.

 ```js
function doSomethingCool(FeatureXYZ) {
  var helper = FeatureXYZ || function { /** 기본 XYZ 기능 **/ }

  var val = helper();
  // ...
}
 ```

## 3. 정리

변수는 타입이 없지만, 값에는 타입이 존재.

``undefined``와 ``undeclared``가 대충 같다고 보는 개발자들이 있지만, 자바스크립트 엔진은 둘을 전혀 다르게 취급한다.

자바스크립트 또한 안타깝게도 이 둘을 뭉뚱그려서 에러 메세지(``"ReferenceError: a is not defined"``)뿐만 아니라 typeof 반환값도 모두 "undefined"로 뭉뚱그려진다.

그래도 typeof의 안전가드(safe guard) 덕분에 선언되지 않은 변수에 사용하면 제법 쓸만 하다.
