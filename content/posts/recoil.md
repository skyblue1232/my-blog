---
title: "Recoil로 React 상태 관리 쉽게 하기"
description: "Redux와 MobX 등 상태관리 라이브러리를 간단히 비교하고 Recoil의 핵심 개념인 Atom과 Selector를 이해하기 쉽게 정리했습니다."
date: 2024-11-15
tags: ["React", "State", "Recoil"]
category: frontend
---

React 애플리케이션을 개발하다 보면 여러 컴포넌트에서 같은 상태를 공유해야 하는 상황이 자주 발생합니다.

하지만 React는 기본적으로 **단방향 데이터 흐름**을 가지기 때문에 부모에서 자식으로만 props를 전달할 수 있습니다.

이 때문에 프로젝트 규모가 커질수록 **props drilling** 문제가 발생하게 됩니다.

## 1. Props Drilling 문제

예를 들어 아래와 같은 컴포넌트 구조가 있다고 가정해봅니다.

```text
App
 └ Parent
     └ Child
         └ GrandChild
```

App의 상태를 GrandChild에서 사용하려면 중간 컴포넌트들을 모두 거쳐 props를 전달해야 합니다.

이렇게 되면 코드가 복잡해지고 컴포넌트의 재사용성도 떨어지게 됩니다.

## 2. 상태관리 라이브러리

이 문제를 해결하기 위해 다양한 상태관리 라이브러리가 등장했습니다.

- Redux
- MobX
- Recoil

각 라이브러리는 서로 다른 특징을 가지고 있습니다.

### Redux

Redux는 Flux 아키텍처를 기반으로 한 상태관리 라이브러리입니다.

- 하나의 Store에서 상태 관리
- Action → Reducer → Store 흐름
- 단방향 데이터 흐름

확장성과 디버깅에 강점이 있지만 보일러플레이트 코드가 많고 러닝커브가 높은 편입니다.

### MobX

MobX는 Redux보다 훨씬 단순하게 상태를 관리할 수 있는 라이브러리입니다.

- 보일러플레이트 코드가 적음
- 러닝커브가 낮음
- 여러 개의 Store 사용 가능

다만 상태 변경이 자유로운 만큼 대규모 프로젝트에서는 관리가 어려워질 수 있습니다.

## 3. Recoil이란?

Recoil은 Facebook에서 만든 React 전용 상태관리 라이브러리입니다.

Recoil은 **Atom**과 **Selector**라는 개념을 중심으로 상태를 관리합니다.

## 4. Atom

Atom은 Recoil에서 상태의 기본 단위입니다.

Atom을 구독하는 컴포넌트들은 해당 상태가 변경될 때만 다시 렌더링됩니다.

```ts
import { atom } from "recoil"

const textState = atom({
  key: "textState",
  default: ""
})
```

## 5. Selector

Selector는 기존 상태를 기반으로 새로운 값을 만들어내는 **파생 상태**입니다.

```ts
import { selector } from "recoil"

const charCountState = selector({
  key: "charCountState",
  get: ({get}) => {
    const text = get(textState)
    return text.length
  }
})
```

Selector는 데이터 가공뿐만 아니라 비동기 데이터 처리에도 사용할 수 있습니다.

## 6. Recoil 사용 예제

```tsx
import { useRecoilState } from "recoil"

function TextInput() {

  const [text, setText] = useRecoilState(textState)

  const onChange = (e) => {
    setText(e.target.value)
  }

  return (
    <input
      value={text}
      onChange={onChange}
    />
  )
}
```

useRecoilState는 React의 useState와 비슷하지만 전역 상태를 관리할 수 있다는 차이가 있습니다.

## 마무리

Recoil은 React와 매우 자연스럽게 통합되는 상태관리 라이브러리입니다.

- 보일러플레이트 코드가 적음
- React Hook 기반 사용
- 컴포넌트 단위 렌더링 최적화

복잡한 Redux 구조가 부담스럽다면 Recoil은 좋은 대안이 될 수 있습니다.
