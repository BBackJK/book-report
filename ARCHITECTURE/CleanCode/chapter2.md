# 의미 있는 이름

이름을 잘 짓는 규칙

## 1. 의도를 분명히 밝혀라.

좋은 이름을 지으려면 시간이 걸리지만 좋은 이름으로 절약하는 시간이 훨씬 많다.

변수 / 클래스 / 함수 의 이름은 다음과 같은 질문에 답해야 한다.

  1. 존재 이유는?
  2. 수행 기능은?
  3. 사용 방법은?

따로 주석이 필요하다면 의도가 명확하지 못하다는 것.

즉,

```java
int d;  // 경과 시간(단위: 날짜 수)
```

와 같은 의미없는 변수명 보다는

```java
int elapsedTimeInDays;
int daysSinceCreation;
int daysSinceModification;
int fileAgeInDays;
```

와 같은 의도가 정확한 이름이 필요.

이름을 지을 때 의도를 정확하게 하면 다음과 같은 효과를 볼 수 있다.

```java
// Bad Code

public List<int[]> getThme() {
  List<int[]> list1 = new ArrayList<int[]>();
  for (int[] x : theList) {
    if (x[0] == 4) {
      list1.add(x);
    }
  }
  return list1;
}

// 안좋은 이유
// 1. theList는 무엇인가?
// 2. thsList의 각 원소 중 각 첫번째 자리는 왜 중요한가?
// 3. 값 4는 무슨 의미인가?
// 4. 함수가 반환하는 리스트 list1은 어떻게 사용하는가?
```

이렇게 변환이 가능해져서 **가독성이 높아진다.**

```java
// Good Code
public List<int[]> getFlaggedCells() {
  List<int[]> flaggedCells = new ArrayList<int[]>();
  for (int[] cell : gameBoard) {
    if (cell[STATUS_VALUE] == FLAGGED) {
      flaggedCells.add(cell);
    }
  }
  return flaggedCells;
}

// 또 이 함수는 이렇게 변경이 될 수 있다.

public List<int[]> getFlaggedCells() {
  List<int[]> flaggedCells = new ArrayList<int[]>();
  for (Cell cell : gameBoard) {
    if (cell.isFlagged()) {
      flaggedCells.add(cell);
    }
  }
  return flaggedCells;
}

// 의도를 명확하게 해주어서 이 함수가 무슨 `역할`을 하는지 알 수 있다.
```

## 2. 그릇된 정보를 피하라.

1. 널리 쓰이는 의미가 있는 단어를 다른 의미로 사용하지 말아라.

2. 서로 흡사한 이름을 사용하지 않도록 주의하되 **유사한 개념**은 **유사한 표기법**을 사용하라.

3. O과 I 혹은 L의 쓰임에 주의하자. '0'과 '1'로 헷갈릴 수 있다.


## 3. 의미 있게 구분하라.

연속된 숫자를 덧붙히는 방식은 적절하지 못하다.

안좋은 예시를 보자.

```java
public static void copyChars(char a1[], char a2[]) {
  for (int i = 0; i < a1.length; i++) {
    a2[i] = a1[i];
  }
}
```

함수의 의도를 보자. copyChars...

char 타입의 데이터들을 복사하는 함수이다.

그렇다면 다음과 같이 바꿔볼 수 있다.

```java
public static void copyChars(char source[], char destination[]) {
  for (int i = 0; i < source.length; i++) {
    destination[i] = source[i];
  }
}
```

불용어(noise word)를 추가하는 방식 또한 적절하지 못하다.

만약, Product라는 클래스가 있다고 가정하였을 시,

다른 클래스를 ProductInfo 혹은 ProductData라 명명한다면 개념을 구분하지 않은 채 이름만 달리한 경우이다.

무조건 사용하면 안된다는 것이 아니다.

개념이 다르게 구분되어지고 하는 역할 또한 다르다면 사용해도 무방하다.

즉, 다음과 같은 형태는 아주 좋지 않은 이름이다.

```
getActiveAccount();
getActiveAccounts();
getActiveAccountInfo();
```

## 4. 발음하기 쉬운 이름을 사용하라.

```java
// Bad Code
Class DtaRcrd102 {
  private Date genymdhms;
  private Date modymdhms;
  private final String pszqint = "102";

  /* ...  */
}

// Good Code
Class Customer {
  private Date generationTimeStamp;
  private Date modificationTimeStamp;
  private final String recordId = "102";

  /* ...  */
}
```

## 5. 검색하기 쉬운 이름을 사용하라.

```java
// Bad Code
for (int j=0; j < 34; j++) {
  s += (t[j]*4)/5;
}

// Good Code
int realDaysPerIdealDay = 4;
const int WORK_DAYS_PER_WEEK = 5;
int sum = 0;

for (int j=0; j < NUMBER_OF_TASKS; j++) {
  int realTaskDays = taskEstimate[j] * realDaysPerIdealDay;
  int realTaskWeeks = (realdays / WORK_DAYS_PER_WEEK);

  sum += realTaskWeeks;
}
```

## 6. 인코딩을 피하라.

개발자에게 인코딩은 불필요한 정신적 부담.

### 헝가리식 표기법

### 멤버변수 접두어

멤버변수에 m_이라는 접두어 x.

### 인터페이스와 구현 클래스

보통 구현하는 접두어 I는 (예를 들면 IShapeFactory) 가독성을 떨어뜨린다.

그냥 ShapeFactoryImpl을 사용하자.

## 7. 자신의 기억력을 자랑하지 마라.

문자 하나를 사용하는 변수를 만들지 마라.

왜? 그것을 만든 장본인만 그 변수의 의미를 알기 때문이다.

**항상 남들이 이해하기 쉬운 코드로 작성하자.**

## 8. 클래스 이름

클래스 이름이나 객체 이름은 명사나 명사구가 적합

```java
// Good name
['Customer', 'WikiPage', 'Account', 'AddressParser', ...]

// Bad name
['Manager', 'Processor', 'Data', 'Info', ...]
```
## 9. 메소드 이름

메소드 이름은 동사구가 적합 (--> 클래스 이름과 반대)

postPayment, deletePage, save 등이 좋은 예.

접근자, 변경자, 조건자는 앞에 get, set, is 등을 붙혀서 활용하자.

```java
// example

String name = employee.getName();
customer.setName("mike");
if (paycheck.isPosted()) { /* ... */ }
```

## 10. 기발한 이름은 피하라.

그들만 아는 문화적인 단어, 정치적인 단어는 피하라.

## 11. 개념 하나에 단어 하나를 사용하라.

같은 개념을 가지는 단어는 하나만 사용해라.

즉, 똑같은 메소드를 클래스마다 fetch, retrieve, get 이라고 각각 부르면 나중에 알기도 어렵고 혼란스럽다.

## 12. 말장난을 하지마라.

한 단어를 두 가지 목적으로 사용하지 마라.

예를 들어, add 라는 클래스가 일관성을 고려하여 **기존 값 두 개를 더하거나 이어서 새로운 값을 만든다는 개념**으로 작성을 할 때, 새로운 메소드가 **어느 집합에 대해서 값을 추가** 하는 기능을 한다면 그 메소드는 add 보다는 insert, append가 나을 것이다.

## 13. 해법 영역에서 사용하는 이름을 사용하라.

기술적인 개념에는 기술적인 이름을 사용하라

> 뭔말인지 모르겠다.

## 14. 문제 영역과 관련 있는 이름을 사용하라.

13과 비슷한...

## 15. 의미 있는 맥락을 추가하라.

```java
// Bad Code
private void printGuessStatistics(char candidate, int count) {
  String number;
  String verb;
  String pluralModifier;

  if (count == 0) {
    numer = "no";
    verb = "are";
    pluralModifier = "s";
  } else if (count == 1) {
    number = "1";
    verb = "is";
    pluralModifier = "";
  } else {
    number = Integer.toString(count);
    verb = "are";
    pluralModifier = "s";
  }

  String guessMessage = String.format(
    "There %s %s %s%s", verb, number, candidate, pluralModifier
  );

  print(guessMessage);
}

// Good Code
public Class GuessStatisticsMessage {
  private String number;
  private String verb;
  private String pluralModifier;

  public String make(char candidate, int count) {
    createPluralDependentMessageParts(count);

    return String.format(
      "There %s %s %s%s",
      verb, number, candidate, pluralModifier
    );
  }

  private void createPluralDependentMessageParts(int count) {
    if (count == 0) {
      thereAreNoLetters();
    } else if (count == 1) {
      thereIsOneLetter();
    } else {
      thereAreManyLetters(count);
    }
  }

  private void thereAreManyLetters(int count) {
    number = Integer.toString(count);
    verb = "are";
    pluralModifier = "s";
  }

  private void thereIsOneLetter() {
    number = "1";
    verb = "is";
    pluralModifier = "";
  }

  private void thereAreNoLetters() {
    number = "no";
    verb = "are";
    pluralModifier = "s";
  }
}
```

## 16. 불필요한 맥락을 없애라.

만약 `고급 휘발유 충전소`라는 어플리케이션을 만든다고 가정하자.

모든 클래스를 GSD로 시작하겠다는 생각은 버려야 한다.



<hr/>

항상 의미를 분명하게 해야한다.

