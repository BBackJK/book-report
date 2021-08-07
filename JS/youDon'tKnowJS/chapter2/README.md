# 값

## 1. 배열

자바스크립트의 배열은 타입이 엄격한 다른 언어와는 달리 문자열, 숫자, 객체 심지어 다른 배열이나 (이런 식으로 다차원 배열을 만든다) 어떤 타입의 값이라도 담을 수 있다.

```js
var a = [1, "2", [3]];

a.length; // 3
a[0] === 1; // true
a[2][0] === 3;  // true
```

구멍 난(sparse) 배열을 다룰 때는 조심하자.

```js
var a = [];

a[0] = 1;
a[2] = 3;

a[1];   // undefined

a.length;   // 3
```

여기서 a[1]의 값의 주의하자. 한 칸 건너뛰어져서 ``undefined``가 될 것 같지만, 명시적으로 ``a[1] = undefined`` 세팅한 것과 똑같지는 않다.

**배열 인덱스는 숫자인데, 배열 자체도 하나의 객체여서 키/프로퍼티 문자열을 추가할 수 있다**는 점을 조심해야 한다.

--> 이때, 배열의 length가 증가하지 않는다.

```js
var a = [];

a[0] = 1;
a["footer"] = 2;

a.length; // 1 --> 배열의 length는 증가하지 않는다. (주의)
a["foobar"];  // 2
a.foobar; // 2
```

또한 키로 넣은 문자열 값이 표준 10진수 숫자로 타입이 바뀌면, 문자열 키가 아닌 숫자 키를 이용한 것과 같은 결과가 초래된다는 점은 정말 주의해야한다.

```js
var a = [];

a["13"] = 42;

a.length; // 14
```

따라서 배열에 문자열 타입의 키/프로터피를 두는 것은 버그가 발생하기 쉬우므로 권장하지 않는다.

### 1.1 유사배열

유사 배열 값(숫자 인덱스가 가리키는 값들의 집합)을 진짜 배열로 바꾸고 싶을 때가 더러 있다.

이럴 때에는 배열 유틸리티 함수 (``indexOf()`` / ``concat()`` / ``forEach()`` 등)을 사용하여 해결하는 것이 일반적이다.

예를 들어 DOM 쿼리 작업을 수행하면 비록 배열은 아니지만 변환 용도로는 충분한, 유사 배열 형태의 DOM 원소 리스트가 반환된다.

다른 예로, 함수에서 (배열 비슷한) arguments 객체를 사용하여 인자를 리스트로 가져오는 것도 마찬가지이다. --> **ES6부터는 비권장**

이런 변환은 ``slice()`` 함수의 기능을 차용하는 방법을 가장 많이 쓴다.

```js
// 다른 예로, 함수에서 (배열 비슷한) arguments 객체를 사용하여 인자를 리스트로 가져오는 것도 마찬가지이다.
function foo() {
  var arr = Array.prototype.slice.call(arguments);
  arr.push("bam");
  console.log(arr);
}

foo("bar", "baz");  // ["bar", "baz", "bam"]
```

> ``slice(arguments)`` 는 ``slice(arguments, 0)``와 마찬가지로 동작하므로 첫 번째 원소부터 끝 까지 잘라내므로 배열을 복사하는 것과 다름 없다.

아까 말했던 ES6에서는 이런 기능을 내장 함수로 만들어놨다.

```js
...
var arr = Array.from(arguments);
...
```

## 2. 문자열

흔히들 문자열은 단지 문자들의 배열이라고 생각한다.

엔진이 내부적으로 배열을 쓰도록 구현되었는지는 모르겠지만 자바스크립트 문자열은 실제로 생김새만 비슷할 뿐 문자 배열과 같지 않다는 사실을 알아야 한다.

다음 두 값을 보자.

```js
var a = "foo";
var b = ["f", "o",  "o"];
```

문자열은 배열과 겉모습이 닮았다. --> 즉, 유사배열이다.

이를테면 둘 다 ``length`` 프로퍼티, ``indexOf()`` 메소드(es5 배열에만 있음), ``concat()`` 메소드를 가진다.

```js
var a = "foo";
var b = ["f", "o",  "o"];

a.length; // 3
b.length; // 3

a.indexOf("o"); // 1
b.indexOf("o"); // 1

var c = a.concat("bar");  // foobar
var d = b.concat(["b", "a", "r"]);  // ["f", "o", "o", "b", "a", "r"]

a === c;  // false
b === d;  // false

a;  // "foo"
b;  // ["f", "o", "o"]
```

그렇다면 기본적으로 둘 다 "문자의 배열"이라고 할 수 있을까?

```js
a[1] = "0";
b[1] = "0";

a;  // "foo"
b;  // ["f", "0", "o"]
```

그렇지 않다.

문자열은 불변 값이지만, 배열은 가변 값이다.

``a[1]`` 처럼 문자열의 특정 문자를 접근하는 형태는 모든 자바스크립트 엔진에서 유효한 것은 아니다.

실제로 구버전의 IE는 이를 에러라고 인식한다.

또한, 문자열은 불변 값이므로 **문자열 메서드는 그 내용을 바로 변경하지 않고 항상 새로운 문자열을 생성한 후 반환한다.**

```js
c = a.toUpperCase();
a === c   // false

a;  // "foo"
c;  // "FOO"

b.push("!");
b;  // ["f", "0", "o", "!"]
```

그리고 문자열을 다룰 때에는 유용한 대부분의 배열 메서드는 사용할 수 없지만

불변 배열 메서드를 빌려 쓸 수는 있다.

```js
a.join; // undefined
a.map;  // undefined

var c = Array.prototype.join.call(a, "-");
var d = Array.prototype.map.call(a, function(v) {
  return v.toUpperCase() + ".";
}).join("");

c;  // "f-o-o"
d;  // "F.O.O"
```

## 3. 숫자

### 3.1 작은 소수 값

다음은 널리 알려진 이진 부동 소수점 숫자의 부작용 문제다.

```js
0.1 + 0.2 === 0.3;  // false
```

결과적으로만 말하면 ``0.1 + 0.2``는 실제 컴퓨터 계산 값에 의하면 0.3000000000004에 가깝다.

그럼 어떻게 비교해야 할까?

가장 일반적으로는 미세한 '반올림 오차'를 허용 공차로 처리하는 방법이 있다.

이렇게 미세한 오차를 '머신 입실론'이라고 하는데, 자바스크립트의 숫자의 머신 입실론은 2^-52(2.220446049250313e-16)이다.

ES6부터는 이 값이 Number.EPSILON으로 미리 정의되어 있고,

ES6 이전은 다음과 같은 폴리필을 사용하자.

```js
if (!Number.EPSLION) {
  NumberEPSLION = Math.pow(2, -52);
}
```

이 ``Number.EPSLION``으로 두 숫자의 (반올림 허용 오차 이내의) '동등함'을 비교할 수 있다.

```js
function numbersCloseEnoughToEquals(n1, n2) {
  return Math.abs(n1 - n2) < Number.EPSILON;
}

var a = 0.1 + 0.2;
var b = 0.3;

numbersCloseEnoughToEquals(a, b); // true
numbersCloseEnoughToEquals(0.0000001, 0.0000002); // false
```

### 3.2 안전한 정수 범위

숫자를 표현하는 방식이 이렇다 보니, **정수**는 Number.MAX_VALUE보다 훨씬 작은 수준에서 **안전**값의 범위가 정해져있다.

그 범위는 2^53-1(9007199254740991) 이다.

이 값은 ES6에서 ``Number.MAX_SAFE_INTEGER``로 정의하며, 최솟값은 ``Number.MIN_SAFE_INTEGER``로 정의해 놓았다.

**자바스크립트 프로그램에서 이처럼 아주 큰 숫자에 맞닥뜨리는 경우는 데이터베이스 등에서 64비트 ID를 처리할 때**가 대부분이다.

64비트 숫자는 숫자 타입으로 정확하게 표시할 수 없으므로 (주고 받을 때) 자바스크립트 string 타입으로 저장해야 한다.

하지만 이렇게 큰 ID 값을 숫자로 연산할 일은 흔치 않다. 하지만 사용해야 할때가 온다면 ``BigInteger.js`` 유틸리티를 사용하라.

> 참고할 github [BigInteger](https://github.com/peterolson/BigInteger.js)

### 3.3 정수인지 확인

ES6부터는 ``Number.isInteger()``로 어떤 값의 정수 여부를 확인한다.

```js
Number.isInteger(42); // true
Number.isInteger(42.000); // true
Number.isInteger(42.123); // false
```

ES6 이전 버전은 다음과 같은 폴리필을 사용하자.

```js
if (!Number.isInteger) {
  Number.isInteger = function(num) {
    return typeof num == "number" && num % 1 == 0;
  }
}
```

## 4. 특수 값

자바스크립트에는 특수한 값이 있어서 개발자들이 조심해야 한다.

### 4.1 값 아닌 값

``undefined``타입의 값은 ``undefined`` 밖에 없다. ``null`` 타입도 값은 ``null``뿐이다.

``undefined``와 ``null``은 종종 '빈' 값과 '값 아닌' 값을 나타낼 때에도 사용한다.

### 4.2 Undefined

느슨한 모드(not strict mode)에서는 전역 스코프에서 ``undefined``란 식별자에 값을 할당할 수 있다.

> 절대 사용하지말자. 최악의 코딩 방법이다.

```js
function foo() {
  undefined = 2;
}

foo();

function foo() {
  "use strict"
  undefined = 2;  // 타입 에러 발생
}

foo();
```

#### void 연산자

``undefined``는 내장 식별자로, 값은 undefined 지만, 이 값은 void 연산자로도 얻을 수 있다.

표현식 void __는 어떤 값이든 **무효로 만들어**, 항상 결괏값을 undefined로 만든다. 기존 값은 건드리지 않고 연산 후 값은 복구할 수 없다.

```js
var a = 42;

console.log(void a, a); // undefined 42
```

void 연산자는 어떤 표현식의 결과값이 없다는 것을 확실히 밝혀야할 때 요긴하다.

```js
function doSomething() {
  // 참고: 'APP.ready'는 이 애플리케이션에서 제공한 값이다.
  if (!APP.ready) {
    // 나중에 다시 해보자!
    return void setTimeout( doSomething, 100);
  }
  
  var result;
  
  return result;
}

if (doSomething()) {
  // 다음 작업 바로 실행
}
```

``setTimeout()`` 함수는 숫자 값(타이머를 취소할 때 사용할 타이머의 고유 식별자)을 반환하지만, 예제에서는 이 숫자값을 무효로 만들어 ``doSomething()``함수의 결과값이 if문에서 긍정 오류가 일어나지 않게 했다.

> 긍정오류; 정상을 비정상으로 판단 / 부정오류; 비정상을 정상으로 판단

다음과 같이 두 줄로 만들어서 사용하는 개발자가 훨씬 많다. 그냥 참고만 하도록 하자(위에 내용을)

```js
if (!APP.ready) {
  setTimeout(doSomething, 100);
  return;
}
```

### 4.3 특수 문자

숫자 타입에는 몇가지 특수한 타입들이 있다.

수학 연산 시 두 피연산자가 전부 숫자(또는 평범한 숫자로 해석 가능한 10진수 또는 16진수)가 아닐 경우 유효한 숫자가 나올 수 없으므로 그 결과는 NaN 이다.

```js
var a = 2 / "foo";  // NaN

typeof a === "number";  // true
```

NaN의 typeof는 number이므로 주의해야 한다.

NaN은 경계 값의 일종으로 숫자 집합 내에서 특별한 종류의 에러 상황(난 당신이 내준 수학 연산을 해봤지만 실패했어, 그러니 여기 실패한 숫자를 도로 가져가!)을 나타낸다.

어떤 변수값이 특수한 실패 문자, 즉 NaN인지 여부를 확인할 때 Null, undefined 처럼 NaN도 직접 비교하고싶은 충동이 있겠지만..

```js
var a = 2 / "foo";

a == NaN; // false
a === NaN;  // false
```

NaN 자체는 다른 어떠한 NaN과 동등할 수 없다.

그렇다면 어떻게 NaN인지 확인할까?

```js
var a = 2 / "foo";

isNaN(a); // true
```

이렇게 보통 확인을 하지만, 이 ``isNaN()`` 함수에는 치명적인 결함이 있다.

이름 그대로, **인자값이 숫자인지 여부를 판단**하는 기능이 전부이다.

```js
var a = 2 / "foo";
var b = "foo";

a;  // NaN
b;  // "foo"

window.isNaN(a);  // true
window.isNaN(b);  // true
```

이러한 버그를 방지하기 위해서 ES6에서는 ``Number.isNaN()``을 만들었다.

ES6 이전 에서는 다음과 같은 폴리필을 사용하도록 하자.

```js
if (!Number.isNaN) {
  Nunber.isNaN = function(n) {
    return (
      typeof n === "number" && window.isNaN(n)
    );
  };
}

var a = 2 / "foo";
var b = "foo";

Number.isNaN(a);  // true
Number.isNaN(b);  // false
```

#### 무한대

다른 언어에서 '0으로 나누기'같은 내용을 컴파일/런타임 에러로 나오게 했지만

javascript에서는 이를 Infinity값으로 잘 정의해놓았다.

```js
var a = 1 / 0;    // Infinity
var b = -1 / 0;    // -Infinity
```

### 4.4 값 vs 레퍼런스

c++ 에서는 어떤 함수에 전달한 숫자 인자 값을 그 함수 내에서 수정하려면 ``int& myNum`` 형태로 함수 인자를 선언하고, 호출하는 쪽에서는 변수 x를 넘기면 myNum은 x를 참조한다.

래퍼런스 인자를 선언하지 않으면 언제나 복사된다.

**자바스크립트는 포인터라는 개념 자체가 없고, 참조하는 방법도 조금 다르다.**

우선 어떤 변수가 다른 변수를 참조할 수 없다.

자바스크립트에서 레퍼런스는 (공유된) 값을 가리키므로 서로 다른 10개의 래퍼런스가 있다면 이들은 저마다 항상 공유된 단일 값을 **개별적으로** 참조한다.


```js
var a = 2;
var b = a;  // 'b'는 언제나 'a'에서 값을 복사한다.
b++;
a;  // 2
b;  // 3

var c = [1, 2, 3];  
var d = c;      // 'd'는 공유된 '[1, 2, 3]'값의 레퍼런스다.

d.push(4);
c;    // [1, 2, 3, 4]
d;    // [1, 2, 3, 4]
```

즉, 자바스크립트에서는 원시타입값은 언제나 값-복사 방식으로 할당/전달된다.

**그 외에 값들(객체, 함수 등)은 반드시 레퍼런스 사본을 생성하여 할당/전달한다.**

**레퍼런스는 변수가 아닌 값 자체를 가리키므로 A 레퍼런스로 B 레퍼런스가 가리키는 대상을 변경할 수는 없다.**

```js
var a = [1, 2, 3];
var b = a;

a;  // [1, 2, 3]
b;  // [1, 2, 3]

b = [4, 5, 6];  // [4, 5, 6]에 대한 레퍼런스를 변수가 참조.

a;  // [1, 2, 3]
b;  // [4, 5, 6]
```

```js
function foo(x) {
  x.push(4);
  x;    // [1, 2, 3, 4]

  x = [4, 5, 6];
  x.push(7);
  x;    // [4, 5, 6, 7]
}

var a = [1, 2, 3];
foo (a);
a;  // [4, 5, 6, 7]이 아닌 [1, 2, 3, 4]가 출력.
```

a를 인자로 넘기면 a의 레퍼런스 사본이 x에 할당.

x와 a는 모두 동일한 [1, 2, 3]을 가리키는 별도의 레퍼런스.

이 후, 함수 내부에서 x에 새 값을 할당해도 초기 레퍼런스 a가 참조하고 있는 [1, 2, 3]에는 아무런 영향 x.

> 따라서 배열과 같은 값을 값-복사에 의해 효과적으로 전달하려면 손수 값의 사본을 만들어 전달한 레퍼런스가 원본을 가리키지 않게 하면 된다.

```js
foo(a.slice());
```

반대로 원시 값을 레퍼런스처럼 바뀐 값이 바로바로 반영되도록 넘기려면 원시 값을 다른 합성값으로 감싸야한다.

```js
function foo(wrapper) {
  wrapper.a = 42;
}

var obj = {
  a: 2,
}

foo(obj);

obj.a;    // 42
```
