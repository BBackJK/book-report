# 강제변환

## 1. 값 변환

어떤 값을 다른 탕비의 값으로 바꾸는 과정이 명시적이면 **타입 캐스팅**

암시적이면 **강제변환**이라고 한다.

```js
var a = 42;

var b = a + "";    // 강제변환

var c = String(a);  // 타입 캐스팅
```

## 2. 추상 연산

### 2.1 ToString

``문자열이 아닌 값 -> 문자열`` 변환 작업은 ES5의 ``ToString`` 추상 연산 로직이 담당한다.

내장 원시 값은 본연의 문자열화 방법이 정해져 있다.

**숫자값**은 예상대로 그냥 문자열로 바뀌고 너무 작거나 큰 값은 지수 형태로 바뀐다.

```js
// 1.07에 1000을 7번 곱한다.
var a = 1.07 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000;

// 소수점 이하로 3 x 7 => 21자리까지 내려간다.
a.toString(); // 1.07e21
```

**일반 객체**는 특별히 지정하지 않으면 기본적으로 ``toString()`` 메소드가 내부 ``[[Class]]``를 반환한다.

자신의 ``toString()`` 메소드를 가진 객체는 문자열처럼 사용하면 자동으로 이 메소드가 기본 호출되어 ``toString()``을 대체한다.

> 엄밀히는 '객체 -> 문자열' 강제변환 시 ``ToPrimitive`` 추상 연산과정을 거친다.

**배열**은 기본적으로 재정의된 ``toString()``이 있다. 문자열 변환 시 모든 원소 값이 콤마(,)로 분리된 형태로 이어진다.

```js
var a = [1, 2, 3];
a.toString();   // "1, 2, 3";
```

#### 2.1.1 JSON 문자열화

``ToString()``은 ``JSON.stringify()`` 유틸리티를 사용하여 어떤 값을 JSON 문자열로 직렬화하는 문제와도 연관된다.

JSON 문자열화는 강제변환과 똑같지는 않지만, 방금 전 살펴본 ``ToString`` 규칙과 관련이 있으므로 JSON 문자열화에 대해 잠시 알아본다.

대부분 단순 값들은 직렬화 결과가 반드시 문자열이라는 점 제외하고는, JSON 문자열화나 ``toString()`` 변환이나 기본적으로 같은 로직이다.

```js
JSON.stringify(42); // 42
JSON.stringify("42"); // "42"
JSON.stringify(null); // "null"
JSON.stringify(true); // "true"
```

JSON 안전 값(``JSON-Safe Value``)은 모두 ``JSON.stringify()``로 문자열화할 수 있다.

반면 JSON 안전 값(``JSON-Safe Value``)이 아닌 값(undefined, 함수, 심벌 값)들은 자동으로 누락시키며, 이 값들이 배열안에 있으면 null로 바꾸어버리고, 객체 프로퍼티 안에 있으면 지워버린다.

```js
JSON.stringify(undefined);    // undefined
JSON.stringify(function(){});  // undefined

JSON.stringify(
  [1, undefined, function() {}, 4]
);                        // [1, null, null]

JSON.stringify(
  { a: 2, b: function() {} }
);                        // {"a": 2}
```

혹시라도 ``JSON.stringify()``에 환형 참조 객체를 넘기면 에러가 난다.

또한 객체 자체에 ``toJSON()``이라는 메소드가 정의되어 있다면, 먼저 이 메소드를 호출하여 직렬화한 값을 반환.

또한 부적절한 JSON 값이나 직렬화하기 곤란한 객체 값을 문자열화하려면 ``toJSON()`` 메소드를 **따로 정의해야한다.**

```js
var o = {};

var a = {
  b: 42,
  c: o,
  d: function() {}
};

o.e = a;  // 'a'를 환형 참조 객체로 만든다.

// 환형 참조 객체는 JSON 문자열화 시 에러
// JSON.stringify(a);

// JSON 값으로 직렬화하는 함수를 따로 정의한다.
a.toJSON = function() {
  // 직렬화에 프로퍼티 'b'만 포함시킨다.
  return { b: this.b };
}

JSON.stringify(a);  // {"b": 42}
```

> ``toJSON()`` 메소드는 문자열하기 적당한 JSON 안전 값으로 바꾸는 것이며, 단순히 JSON 문자열로 바꾸는 것이 아니다.

```js
var a = {
  val: [1, 2, 3],
  toJSON: function() {
    return this.val.slice(1);     // 올바르게 사용
  }
}

var b = {
  val: [1, 2, 3],
  toJSON: function() {
    return "[" + this.val.slice(1).join() + "]";  // 올바르지 못하게 사용
  }
};

JSON.stringify(a);  // [2, 3]
JSON.stringify(b);  // "[2, 3]"
```

두 번째 호출 코드는 배열 자체가 아니라 반환된 문자열을 다시 문자열화 한다. --> 이건 개발자가 의도한 바가 아닐 것이다!

* 아주 유용한 기능

배열 혹은 함수 형태의 대체자(Replacer)를 ``JSON.stringify()``의 두번 째 선택 인자로 지정하면 객체를 재귀적으로 직렬화하면서 필터링 하는 방법이 있다. 

> ``toJSON()``이 직렬화한 값을 준비하는 방식과 동일

```js
var a = {
  b: 42,
  c: "42",
  d: [1, 2, 3]
};

JSON.stringify(a, ["b", "c"]);        // { "b": 42, "c": "42" }
JSON.stringify(a, function(k, v) {
  if (k !== "c") return v;
});                                   // { "b": 42, "d": [1, 2, 3] }
```

> 함수인 대체자(Replacer)는 최초 호출 시 객체 자신을 전달하므로 키 인자 k는 undefined 이다. 

또한, 두번 째 인자 말고 세번 째 인자를 줄 수 있다.

이 인자는 스페이스라고 하며 사람이 읽기 쉽도록 들여쓰기를 할 수가 있다.

```js
var a = {
  b: 42,
  c: "42",
  d: [1, 2, 3]
};

JSON.stringify(a, null, 3);
// "{
//  "b": 42,
//  "c": "42",
//  "d": [
//     1,
//     2,
//     3,
//   ]
// }"

JSON.stringify(a, null, "-----");
// "{
// -----"b": 42,
// -----"c": "42",
// -----"d": [
// ----------1,
// ----------2,
// ----------3,
// -----]
// }"
```

즉, ``JSON.stringify()``는 직접적인 강제변환의 형식은 아니지만 두 가지 이유로 ToString 강제 변환과 연관된다.

> 1. 문자열, 숫자, 불리언, null 값이 JSON으로 문자열화하는 방식은 ToString 추상 연산의 규칙에 따라 문자열 값으로 강제변환되는 방식과 동일하다.
> 2. JSON.stringify()에 전달한 객체가 자체 toJSON() 메소드를 갖고 있다면, 문자열화 전 toJSON()가 자동 호출되어 JSON 안전값으로 강제변환된다.



### 2.2 ToNumber

예를 들어 ``true``는 1, ``false``는 0. ``undefined``은 ``NaN``으로, (희한하게도) ``null``은 0으로 바뀐다.

문자열 값에 ``ToNumber``를 적용하면 대부분 숫자 리터럴은 규칙/구문과 비슷하게 동작한다.

변환이 실패하면 결과는 NaN이다. 

객체는 일단 동등한 원시 값으로 변환 후 그 결과값(아직 숫자가 아닌 값)을 앞서 설명한 ``ToNumber`` 규칙에 의해 강제변환한다.

동등한 원시 값으로 바꾸기위해 ``ToPrimitive`` 과정에서 해당 객체가 ``valueOf()`` 메소드를 구현했는지 확인한다.

``valueOf()`` 메소드를 쓸 수 있고 반환값이 원시값이면 그대로 강제변환하되, 그렇지 않을 경우 ``toString()``을 이용하여 강제변환한다.

어찌해도 변환할 수 없는때에는 TypeError 오류를 내던진다.

```js
var a = {
  valueOf: function() {
    return "42";
  }
}

var b = {
  toString: function() {
    return "42";
  }
}

var c = [4, 2];

c.toString = function() {
  return this.join("");   // 42
};


Number(a);        // 42
Number(b);        // 42
Number(c);        // 42
Number("");       // 0
Number([]);       // 0
Number(["abc"]);  // NaN
```

### 2.3 ToBoolean

자바스크립트에서는 1을 true로, 0을 false로 (역방향도 마찬가지) 강제변환할 수는 있지만

그렇다고 두 값이 똑같은건 아니다.

#### falsy 값

true/false가 아닌 값을 불리언에 상당한 값으로 강제변환했을 때, 이 값들은 어떻게 동작할까?

자바스크립트의 모든 값을 다음 둘 중 하나이다.

1. 불리언으로 강제변환하면 false가 되는 값
2. 1번을 제외한 나머지(즉, 명백히 true인 값)

자바스크립트 명세에서는 falsy한 값들을 다음과 같이 정의한다.

* undefined
* null
* false
* +0, -0, NaN
* ""

#### falsy 객체

위에서 falsy한 값들을 정의한 값 외에는 truthy 하다고 했는데 falsy 객체는 뭘까?

```js
var a = new Boolean(false);
var b = new Number(0);
var c = new String("");

var d = Boolean(a && b && c);

d;  // true
```

#### truthy 값

falsy한 값 외에는 모두 truthy 값이다.

```js
var a = 'false';
var b = '0';
var c = '""';
var d = Boolean(a && b && c);

console.log(d); // true
```

## 3. 명시적 강제변환

명시적 강제변환은 분명하고 확실한 타입변환.

이 절의 목적은 다른 개발자가 본인이 작성한 코드로 인해 구렁텅이에 빠지지 않도록 값의 타입변환 과정을 분명하고 명확하게 할 수 있는 패턴을 여러분 스스로 찾게 하는 것.

### 3.1 명시적 강제변환: 문자열 <-> 숫자

가장 빈번하게 일어나는 강제변환.

문자열 <-> 숫자 변환은 ``String()``과 ``Number()`` 함수를 이용한다.

이 때, new 키워드가 붙지 않기 때문에 객체 래퍼를 생성하는 것이 아니다.

```js
var a = 42;
var b = String(a);
var c = "3.14";
var d = Number(c);

b;  // "42"
d;  // 3.14
```

다른 방법으로는 

```js
var a = 42;
var b = a.toString();

var c = "3.14";
var d = +c;

b;  // "42"
d;  // 3.14
```

이러한 변환은 겉보기에는 명시적이지만, 몇가지 숨은 비밀이 있다.

원시값 42에는 ``toString()`` 메서드가 없으므로, 자바스크립트 엔진은 ``toString()``를 사용할 수 있게 자동으로 42를 객체 래퍼로 **박싱**한다.

또한 ``+c``의 ``+``는 단항 연산자로써, 피연산자 c를 숫자로 인식하게 하는 명시적 강제변환이다.

> 하지만 단항연산자를 이용한 명시적 강제변환은 그닥 좋은 방법은 아니다.

#### 날짜 -> 숫자

위에서 살펴보았던 ``+`` 단한 연산자는 **Date 객체 -> 숫자** 강제변환 용도로 쓰인다.

결과값이 날짜/시각 값을 유닉스 타입스탬프 표현형이기 때문이다.

```js
var d = new Date("Mon, 18 Aug 2014 08:53:06 CDT");
+d; // 1408369986000
```

하지만 이것 또한 좋은 방법이 아니므로 다음과 같이 사용하길 권장한다.

```js
var timestamp = new Date().getTime();
// var timestamp = (new Date()).getTime();
// var timestamp = (new Date).getTime();

var timestampEs5 = Date.now();
```

### 3.2 명시적 강제변환: 숫자 형태의 문자열 파싱

문자열이 포함된 숫자를 파싱하는 것은 앞서 배운 ``문자열 <-> 숫자`` 강제변환과 결과는 비슷하지만, 분명한 차이가 존재한다.

```js
var a = "42";
var b = "42px";

Number(a);  // 42
parseInt(a);  // 42

Number(b);  // NaN
parseInt(b);  // 42
```

### 3.3 명시적 강제변환: * -> 불리언

불리언은 ``Boolean()``에 의한 명시적인 강제변환 방법이다. (앞에 new 키워드 x)

```js
var a = "0";
var b = [];
var c = {};

var d = "";
var e = 0;
var f = null;
var g;

Boolean(a); // true
Boolean(b); // true
Boolean(c); // true

Boolean(d); // false
Boolean(e); // false
Boolean(f); // false
Boolean(g); // false
```

`+` 단항 연산자로 문자열 값을 숫자로 변경하는 것처럼 불리언에는 `!` 인 부정 단항 연산자가 있다.


```js
var a = "0";
var b = [];
var c = {};

var d = "";
var e = 0;
var f = null;
var g;

!!a   // true
!!b   // true
!!c   // true

!!d   // false
!!e   // false
!!f   // false
!!g   // false
```

또한 삼항 연산자에서도 쓰인다

```js
var a = 42;
var b = a ? true : false;
```

b에 true 나 false 값 중 하나가 연산 결과로 도출된다는 점에서 명시적인 ``ToBoolean`` 강제변환의 모습과 닮았지만 암시적 강제변환이 매복해 있다.

a 자체는 숫자값인데, 이 숫자값을 불리언으로 강제변환해야 표현식 자체에 true/false 여부를 따져볼 수 있기 때문이다.

> 저런식의 암시적인 강제변환보다는 `Boolean(a)`나 `!!a` 같은 명시적 강제변환이 훨씬 좋다.


## 4. 암시적 변환

암시적 강제변환은 부수 효과가 명확하지 않게 숨겨진 형태로 일어나는 타입 변환을 말한다.

### 4.1 암시적이란?

암시적 강제변환은 많은 개발자들이 싫어하는 코드지만 분명 나쁜 것만 존재하진 않는다.


### 4.2 암시적 강제변환: 문자열 <-> 숫자

`+` 연산자는 `숫자의 덧셈, 문자열 접합` 두 가지 목적으로 오버로드된다.

```js
var a = "42";
var b = "0";

var c = 42;
var d = 0;

a + b;  // "420";
c + d;  // 42;
```

피연산자가 한쪽 또는 양쪽 모두 문자열인지 아닌지에 따라 + 연산자가 문자열 붙히기를 할지 결정한다고 보통 생각하지만 그것 보다 훨씬 더 복잡하다.

```js
var a = [1, 2];
var b = [3, 4];

a + b;  // 1,23,4
```

피연산자 a,b 모두 문자열이 아니지만 분명히 둘 다 문자열로 강제변환된 후 접합됐다.

즉, `+` 알고리즘은 한쪽 피연산자가 문자열이거나 다음 과정을 통해 문자열으로 표현할 수 있으면 문자열 붙히기를 한다.

즉, 피연산자중 하나가 객체(배열 포함)라면, 먼저 이 값에 `ToPrimitive` 추상 연산을 수행하고, 다시

`ToPrimitive`는 Number 콘텍스트 힌트를 넘겨 `[[DefaultValue]]` 알고리즘을 호출한다.

이게 암시적 강제변환과 무슨 상관일까?

숫자는 공백 문자열 "" 와 더하면 간단히 문자열로 강제변환된다.

```js
var a = 42;
var b = a + "";

b;  // "42"
```

`a + ""`는 숫자를 문자열로 변경하는 아주 흔한 관용 코드이다.

### 4.3 암시적 강제변환: 불리언 -> 숫자

암시적 강제변환의 효용성은 복잡한 형태의 불리언 로직을 단순한 숫자 덧셈 형태로도 단순화할 수 있다.

```js
function onlyOne(a, b, c) {
  return !!((a && !b && !c) || (!a && b && !c) || (!a && !b && c));
}

var a = true;
var b = false;

onlyOne(a, b, b); // true
onlyOne(b, a, b); // true

onlyOne(a, b, a); // false
```

`onlyOne()`는 세 인자 중 정확히 하나만 true/truthy인지 아닌지를 확인하는 함수로 truthy 체크 시 암시적 강제변환을 하고 최종 반환 값을 포함한 다른 부분은 명시적 강제변환을 한다.

그런데 이런식으로 4개, 5개, ... 20개 인자를 처리해야할 경우 모든 비교 로직을 비교하여 처리하는 것이 여간 쉬운일이 아니다.

이 때, 불리언을 숫자로 변환하면 의외로 쉽게 풀린다.

```js
function onlyOne() {
  var sum = 0;

  for (var i = 0; i < arguments.length; i++) {
    // falsy 값은 건너 뛴다.
    // 0으로 취급하는 셈. 그러나 NaN은 피해야 한다.

    if(arguments[i]) {
      sum += arguments[i];
    }

    return sum == 1;
  }
}

var a = true;
var b = false;

onlyOne(b, a); // true
onlyOne(b, a, b, b, b);  // true

onlyOne(b, b); // false
onlyOne(b, a, b, b, b, a); // false
```

위 코드는 해석하면 알겠지만 인자 중 딱 하나만 true일 때, sum은 1이고 그 외에는 1이 되지 않으므로 조건에 부합하는지 확인할 수 있다.

```js
function onlyOne() {
  var sum = 0;
  for (var i = 0; i < arguments.length; i++) {
    sum += Number(!!arguments[i]);
  }

  return sum === 1;
}
```

먼저 `!!arguments[i]`로 인자 값을 true/false로 강제변환한다.

따라서 ``onlyOne("42", 0)`` 처럼 불리언이 아닌 값을 넘긴다 해도 문제가 되지 않는다.

> 이러한 유용한 암시적 강제변환이 있다.

### 4.4 암시적 강제변환: * -> 불리언

불리언으의 암시적인 강제변환이 일어나는 표현식은 다음과 같다.

1. if() 문의 조건 표현식
2. for ( ; ; ) 에서 두 번째 조건 표현식
3. while() 및 do...while() 루프의 조건 표현식
4. ?: 삼항 연산 시 첫 번째 조건 표현식
5. || 및 && 의 좌측 피연산자 


```js
var a = 42;
var b = "abc";
var c;
var d = null;

if (a) {
  console.log('Yes'); // Yes
}

while(c) {
  consol.log('never play');
}

c = d ? a : b;
c;  // "abc";

if ((a && d) || c) {
  console.log('Yes'); // Yes
}
``` 

### 4.5 && 와 || 연산자

논리연산자라고 불리우지만 자바스크립트에서는 **피연산자 선택 연산자**의 기능을 하기도 한다.

```js
var a = 42;
var b = "abc";
var c = null;

a || b; // 42
a && b; // "abc"

c || b; // "abc"
c && b; // null
```

> && 연산자는 첫 번째 피연산자가 true면 두 번째 피연산자 값을, 첫 번째 연산자가 false면 첫 번째 피연산자 값을 내보낸다.


## 5. 느슨한/엄격한 동등 비교

느슨한 동등 비교는 `==`를, 엄격한 동등 비교는 `===`를 사용한다.

많은 사람들이 `==`은 값의 동등함을, `===`는 갑과 타입 모두의 동등함을 비교한다고 생각하지만 사실상 그러지 않다.

정확하게는

`동등함의 비교 시 ==는 강제변환을 허용하지만, ===는 강제변환을 허용하지 않는다.`

### 5.1 비교 성능

타입이 같은 두 값의 동등 비교라면 `==`와 `===`이 동작하는 알고리즘은 동일하다.

강제변환이 필요하다면 느슨한 동등 연산자를, 필요하지 않다면 엄격한 동등 연산자를 사용하자.

> 어차피 ==든, ===든 피연산자의 타입을 체크하는 건 매한가지다. 다른 점은 타입이 다를 때 이후 처리 로직이다.

### 5.2 추상 동등 비교

비교할 두 값이 같은 타입이면 누구나 예상하듯이 값을 식별하여 간단히, 자연스럽게 견주어본다.

* NaN은 그 자신과도 결코 동등하지 않다.
* +0와 -0는 동등하지 않다.

#### 비교하기: 문자열 -> 숫자

```js
var a = 42;
var b = "42";

a === b;  // false
a == b; // true
```

정확히 언제 강제변환이 일어나는걸까?

위에 예시에서는 42가 문자열로 바뀌어서 a가 되는걸까? 아니면 "42"가 숫자로 바뀌어서 b가 되는걸까?

명세를 살펴보면 비교 전 **"42" 값이 숫자로 강제변환된다**는 것을 알 수 있다.

#### 비교하기: * -> 불리언

어떤 값을 true/false와 직접 비교하려고 하면 느슨한 동등 비교(==)의 숨겨진, 가장 끔찍한 강제변환 함정에 빠진다.

```js
var a = "42";
var b = true;

a == b;   // false;
```

"42"는 truthy한 값이므로 == 비교하면 true가 나올 것 같지만 아니다.

명세에는 다음과 같다.

1. Type(x)이 불리언이면 ToNumber(x) == y 의 비교 결과를 반환한다.
2. Type(y)이 불리언이면 x == ToNumber(y) 의 비교 결과를 반환한다.

```js
var x = true;
var y = "42";

x == y;   // false
```

x는 불리언이므로 ToNumber(x)를 거쳐 1이 되게 되고, 1 == "42"이 되는데 타입이 상이하므로 두 번째 피연산자 "42"는 42로 바뀌어서 `1 == 42`가 되어 false가 출력된다.

그래서 보통 다음과 같이 활용한다.

```js
var a = "42";

// Bad Code
if (a == true) {
  // ...
}

// Bad Code, too
if (a === true) {
  // ...
}

// Not Bad (암시적으로 작동한다)
if (a) {
  // ...
}

// Good (명시적으로 작동)
if (!!a) {
  // ...
}

// Good, too (명시적으로 작동)
if (Boolean(a)) {
  // ...
}
```

#### 비교하기: null -> undefined

1. x가 null이고, y가 undefined면 true를 반환한다.
2. x가 undefined이고, y가 null이면 true를 반환한다.

null과 undefined를 느슨한 동등 비교(==)하면 서로에게 타입을 맞춘다.(강제변환한다)

즉, null과 undefined는 느슨한 동등 비교 시 상호 간의 암시적인 강제변환이 일어나므로 비교 관점에서 구분이 되지 않는 값으로 취급되는 것이다.

```js
var a = null;
var b;

a == b;     // true
a == null;  // true
b == null;  // true
a == false; // false
b == false; // false
a == "";    // false
b == "";    // false
a == 0;     // false
b == 0;     // false
```

`null <-> undefined` 강제변환은 안전하고 예측 가능하며, 어떤 다른 값도 비교 결과 긍정 오류을 할 가능성이 없다.

```js
var a = doSomething();

if (a == null) {
  // ...
}
```

`a == null`의 평가 결과는 `doSomething()`이 null이나 undefined를 반환할 경우에만 true, 이외의 값이 반환되면 (심지어 0, false, "" 등의 다른 falsy한 값이 넘어와도 false이다.)

강제변환이 내키지 않아 명시적으로 체크하겠다고 하면 다음처럼 코드가 오히려 애매해질 수도 있다.

```js
var a = doSomething();

if (a === undefined || a === null) {

}
```


#### 비교하기: 객체 -> 비객체

객체/함수/배열과 단순 스칼라 원시 값 비교는 다음과 같이 다루어진다.

1. Type(x)가 String 또는 Number고 Type(y)가 객체라면, x == ToPrimitive(y)의 비교 결과를 반환한다.
2. Type(x)가 Object이고 Type(y)가 String 또는 Number 라면, ToPrimitive(x) == y 의 비교 결과를 반환한다.

```js
var a = 42;
var b = [42];

a == b;   // true
```

3장 네이티브에서 배운 '언박싱'을 상기하자.

원시 값을 감싼 객체 래퍼 (ex. new String("abc"))를 한 꺼풀 벗겨 원시 값("abc")을 반환하는 과정이다. 언박싱은 == 알고리즘의 ``ToPrimitive`` 강제변환과 관련되어 있다.

```js
var a = "abc";
var b = Object(a);  // 'new String(a)' 와 같다.

a === b;      // false
a == b;       // true
```

b는 `ToPrimitive` 연산으로 "abc"라는 단순 스칼라 원시 값으로 강제변환되고, 이 값은 a와 동일하므로 `a == b`는 true이다.

하지만 항상 이런식으로 동작하는 것은 아니다.

```js
var a = null;
var b = Object(a);  // 'Object()' 와 같다.

a == b;   // false

var c = undefined;
var d = Object(c);  // 'Object()' 와 같다.

c == d;   // false

var e = NaN;
var f = Object(e);  // 'new Number(e)'와 같다.
e == f;   // false
```

null과 undefined는 객체 래퍼가 따로 없으므로 박싱할 수 없다. 그래서 ``Object(null)``는 `Object()`로 해석되어 그냥 일반 객체가 만들어진다.

NaN은 해당 객체 래퍼인 Number로 박싱되지만, ==를 만나 언박싱되면 결국 조건식은 NaN == NaN 이 되어 결과는 false이다. (--> NaN은 자기 자신과도 같지가 않으므로)



### 5.3 희귀 사례

가장 골치아프고 쓰기 말아야할 희귀 사례들을 말하겠다.

#### 알 박힌 숫자 값

```js
Number.prototype.valueOf = function() {
  return 3;
}

new Number(2) == 3; // true
```

#### Falsy 비교

```js
"0" == null;          // false
"0" == undefined;     // false
"0" == false;         // true --> 어이쿠!
"0" == NaN;           // false
"0" == 0;             // true
"0" == "";            // false

false == null;        // false
false == undefined;   // false
false == NaN;         // false
false == "0";         // true --> 어이쿠!
false == "";          // true --> 어이쿠!
false == [];          // true --> 어이쿠!
false == {};          // false

"" == null;           // false
"" == undefined;      // false
"" == NaN;            // false
"" == 0;              // true --> 어이쿠!
"" == [];             // true --> 어이쿠!
"" == {};             // false

0 == null;            // false
0 == undefined;       // false
0 == NaN;             // false
0 == [];              // true --> 어이쿠!
0 == {};              // false
```

> '어이쿠'라고 붙힌 주석은 긍정 오류이며, 버그를 만들 상황으로 충분하다.

#### 말도 안되는...

```js
[] == ![];      // true
```

> `!`단항 연산자는  `ToBoolean`으로 불리언 값으로 명시적 강제변환하여 결국에는 [] == false 비교를 하게된다.

```js
2 == [2];     // true
"" == [null]; // true
```

`[2]`, `[null]` 은 각각 `ToPrimitive` 강제변환을 하여 좌변과 비교 가능한 원시 값으로 변환되어 각각 2와 ""으로 바뀐다. 

--> 배열의 `valueOf()` 메소드는 배열 자신을 반환하므로 강제변환 시 배열을 **문자열화** 한다.


#### 근본부터 따져보자.

나쁜 사례 7인방을 살펴보자

```js
"0" == false;   // true
false == 0;     // true
false == "";    // true
false == [];    // true
"" == 0;        // true
"" == [];       // true
0 == [];        // true
```

이러한 비교 코드를 사용할 일은 거의 없다.

#### 암시적 강제변환의 안전한 사용법

* 피연산자중 하나가 `true/false`일 가능성이 있으면 *절대로* `==` 연산자는 사용하지말자.
* 피연산자중 하나가 `[], "", 0`이 될 가능성이 있으면 *가급적* `==` 연산자는 쓰지 말자.


## 6. 추상 관계 비교

추상적 관계 비교 알고리즘은 비교 시 피연산자 모두 문자열일 때와 그 외의 경우, 두 가지로 나뉜다.

이 알고리즘은 먼저 두 피연산자에 대해 `ToPrimitive` 강제변환을 실시하는 것으로 시작하여, 어느 한 쪽이라도 문자열이 아닐 경우 양쪽 모두 ToNumber로 강제변환하여 숫자값으로 만들어 비교한다.

```js
var a = [42];
var b = ["43"];

a < b;    // true
b < a;    // false
```

만약 두 피연산자가 모두 문자열값인 경우, 각 문자를 알파벳 순서로 비교한다.

```js
var a = ["42"];
var b = ["043"];

a < b;    // false
```

두 배열을 `ToPrimitive`로 강제변환하면 문자열이기 때문에 a, b는 숫자로 강제변환하지 않는다.

따라서 "42"와 "043"을 문자 단위로 비교한다. --> 우선 a의 "4"와 b의 "0"을 먼저 비교하고, 그 다음 a의 "2"와 b의 "4"를 비교하는 식


다른 예제를 보자.

```js
var a = { b: 42 };
var b = { b: 43 };

a < b;    // false
```

a도 ``[object Object]``, b 또한 ``[object Object]``로 변환되어 어휘적인 비교를 할 수 없기 때문이다.

하지만,

```js
var a = { b: 42 };
var b = { b: 43 };

a < b;    // false
a == b;   // false
a > b;    // false

a <= b;   // true
a >= b;   // true
```

## 7. 정리하기

강제변환은 많은 욕을 얻어먹지만

꽤나 유용하게 사용되는 경우가 많다.

잘 판단하여 사용하자.


