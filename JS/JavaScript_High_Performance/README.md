# 자바스크립트 성능 최적화

### 1. Script 호출은 페이지를 렌더링 후 하는 것이 더 빠르다.
### 2. 전역변수를 계속해서 접근 하는 것보다 전역변수를 지역변수로 할당하여 지역변수에 접근하는 것이 속도가 빠르다.
### 3. DOM 조작을 할 때 HTML Collection은 배열이 아닌 컬렉션이므로 순회했을 경우 속도가 느리다.
### 4. DOM 에서 조회 및 변경할 때 여러번 하지 말고 지역변수로 선언하여서 작업하면 더 성능이 좋아진다.
### 5. querySelectorAll, querySelector 는 찾은 시점의 정보를 정적인 배열로 복사하므로 찾은 후 DOM이 변경되었을 경우 실시간으로 업데이트 되지 않는다.

### 6. 리플로우는 다음과 같은 상황에서 일어난다.
  - 1. 보이는 DOM 요소를 추가했거나 제거했을 때
  - 2. 요소의 위치가 바뀌었을 때
  - 3. 요소의 크기가 바뀌었을 때 (margin, padding, 테두리 두께, 너비, 높이 등)
  - 4. 텍스트 내용이 바뀌거나 이미지가 다른 크기의 이미지로 대체되는 등 내용이 바뀌었을 때
  - 5. 페이지를 처음 표시할 때
  - 6. 브라우저의 창의 크기를 바꿨을 때

  이 경우에는 **렌더트리 변경을 한꺼번에 모았다가 처리하여야 한다.**

  특히 `offsetTop`, `offsetLeft`, `offsetWidth`, `offsetHeight`, `scrollTop`, `scrollLeft`, `scrollWidth`, `scrollHeight`, `clientTop`, `clientLeft`, `clientWidth`, `clientHeight`, `getComputedStyle()` 의 정보는 현재 상태(변경되었을 때 상태)를 그대로 반영하므로 브라우저는 정확한 값을 반환하기 위해 **렌더링 큐**에 대기중인 변경을 바로 실행하고 리플로우를 실행합니다.

  즉, 스타일을 변경하는 도중에는 위와 같은 속성들을 사용하지 않는 것이 좋습니다.

  ```js
  // 스타일을 설정하고 즉시 읽어옵니다.
  var computed,
      tmp = '',
      bodyStyle = document.body.style;

  if (document.body.currentStyle) {   // 인터넷 익스플로러, 오페라 고려
    computed = document.body.currentStyle;
  } else {
    computed = document.defaultView.getComputedStyle(document.body, '');
  }

  // 똑같은 속성을 변경하고 그 스타일 정보를 바로 읽어오는 예제
  bodyStyle.color = 'red';
  tmp = computed.backgroundColor;
  bodyStyle.color = 'white';
  tmp = computed.backgroundImage;
  bodyStyle.color = 'green';
  tmp = computed.backgroundAttachment;
  ```

  위와 같은 코드에서 브라우저는 계산된 스타일 속성을 반환해야하므로 변경 할 때 마다 렌더 큐를 비우고 리플로우를 실행한다.

  조금 더 효율적으로 변경하려면 다음과 같이 사용해야한다.

  ```js
  // 속성을 미리 다 변경해 놓고
  bodyStyle.color = 'red';
  bodyStyle.color = 'white';
  bodyStyle.color = 'green';
  // 렌더큐를 비우고 리플로우 실행
  tmp = computed.backgroundColor;
  tmp = computed.backgroundImage;
  tmp = computed.backgroundAttachment;
  ```


### 7. 리플로우와 리페인트 최소화 하기

```js
var el = document.getElementById('mydiv');

el.style.borderLeft = '1px';
el.style.borderRight = '2px';
el.style.padding = '5px';
```

세가지 스타일 속성을 변경했다.

그럼 브라우저는 세번 리플로우를 수행한다. (아주 안좋다.)

다음과 같이 효율적으로 변경할 수 있다.

```js
var el = document.getElementById('mydiv');
el.style.cssText = 'border-left: 1px; border-right: 2px; padding: 5px';
```

하지만 이렇게는 css가 어떻게 변경되었는지 디버깅 하기가 어렵기 때문에

보통은 클래스를 설정한다.

```js
var el = document.getElementById('mydiv');
el.className = 'active';  // active는 border-left: 1px; border-right: 2px; padding: 5px 속성을 가지고 있다.
```


### 8. DOM 변경 한번에 처리하기

DOM을 변경할 때에는 작은 단위에 변경은 큰 비용이 들진 않겠지만 (최신 브라우저에서는)

가급적 한번에 변경하는 것이 좋다.

1. 요소를 문서 흐름에서 분리한다.
2. 분리한 요소에 여러가지 변경사항들을 적용한다.
3. 요소를 문서 흐름에 다시 삽입한다.

이렇게하면 1번과 3번에서만 리플로우가 일어난다.

> 보통 위와같이 하지 않는 경우는 2번처럼 직접적으로 DOM 요소에 접근하여서 변경사항들을 적용하면 적용할 때 마다 리플로우가 일어난다.

요소를 문서 흐름에서 분리시키는 데에는 세 가지 방법이 있습니다.

* 요소를 숨기고 변경한 후 다시 드러낸다.
* 현재 DOM 바깥에서 문서 조각을 만들어 변경한 후 문서에 복사합니다.
* 현재 요소를 문서 밖의 노드에 복사해서 사본을 변경한 후 원래 요소를 대체합니다.

```html
<ul id="mylist">
  <li><a href="http://phpied.com">Stoyan</a></li>
  <li><a href="http://julienlecomte.com">Julien</a></li>
</ul>
```
다음과 같은 html 코드에 객체에 있는 데이터를 이 목록에 추가한다고 가정하였을 때 요소의 흐름을 분리시켜보겠습니다.

```js
// 객체에 있는 데이터
var data = [
  {
    'name': 'Nicholas',
    'url': 'http://nczonline.net'
  },
  {
    'name': 'Ross',
    'url': 'http://techfoolery.net'
  }
];

```

다음은 새로운 데이터로 노드를 수정하는 범용 함수입니다.

```js
function appendDataToElement(appendToElement, data) {
  var a, 
      li, 
      i=0, 
      max=data.length, 
      item,
      doc = document;

  for (i;i<max;i++) {
    item = data[i];

    a = doc.createElement('a');
    a.href= item.url;

    a.appendChild(doc.createTextNode(item.name));
    li = doc.createElement('li');
    li.appendChild(a);

    appendToElement.appendChild(li);
  }
}
```

다음과 같이 리플로우를 신경쓰지 않고 목록을 갱신하는 방법은 다음과 같습니다.

```js
var ul = document.getElementById('mylist');
appendDataToElement(ul, data);
```

이 방법을 사용하면 DOM 트리에 항목을 추가할 때마다 리플로우가 일어난다.

다음과 같이 사용하면 리플로우를 줄일 수 있습니다. (첫번째 방법)

```js
var ul = document.getElementById('mylist');
ul.style.display = 'none';
appendDataToElement(ul, data);
ul.style.display = 'block';
```

두번째 방법

```js

var fragment = document.createDocumentFragment();
appendDataToElement(fragment, data);
document.getElementById('mylist').appendChild(fragment);
```

세번째 방법

```js
var old = document.getElementById('mylist');
var clone = old.cloneNode(true);
appendDataToElement(clone, data);
old.parentNode.replaceChild(clone, old);
```

**2번째 방법을 권장합니다.**


### 9. 반복문을 돌릴 때에는 for-in을 사용하지 않기.

for-in은 루프를 반복할 때마다 인스턴스 혹은 프로토타입 체인을 검색해야 하므로 느리다.

또한 보통 반복문을 돌린다면 iterable 한 놈을 순차적으로 반복하는데 이 때 증가 반복문이 아닌 감소 반복문 (역순 반복문) 으로 돌리면 성능이 미약하게 좋아진다.


```js
// 이거보다
var arr = [1,2,3,4,5],
    i = 0,
    l = arr.length;

for (i;i<l;i++) {
  console.log(arr[i]);
}

// 이게 조금 더 좋다.
var arr = [1,2,3,4,5],
    i = arr.length;

for (i; i--;) {
  console.log(arr[i]);
}
```

### 10. 함수에 기반을 둔 반복문 보다는 일반 반복문이 속도가 더 빠르다.

즉, Array의 forEach와 같은 매소드보다 일반 for문이 성능이 더 좋다.

하지만 이것은 가독성과도 직결되기 때문에 잘 조율해서..

