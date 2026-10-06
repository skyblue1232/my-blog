---
title: "Zustand로 React 상태 관리 쉽게 하기"
description: "Redux보다 훨씬 간단한 상태 관리 라이브러리 Zustand의 기본 개념과 store 생성, Devtools, persist, Immer 활용 방법까지 정리했습니다."
date: 2024-12-08
tags: ["React", "Zustand", "State"]
category: frontend
---

React에서 상태 관리를 할 때 Redux, Context API 등 다양한 방법이 존재합니다. 그 중 **Zustand**는 매우 단순한 구조와 적은 보일러플레이트로 전역 상태를 관리할 수 있는 라이브러리입니다.

## Zustand란 무엇인가

Zustand는 독일어로 <strong>"상태"</strong>라는 의미를 가지고 있습니다. React 애플리케이션에서 전역 상태를 관리하기 위한 라이브러리이며 간단한 API와 직관적인 구조가 특징입니다.

### 장점

- 매우 단순한 API
- 보일러플레이트 코드가 거의 없음
- Redux Devtools 지원
- Hook 기반 사용 방식
- 가벼운 번들 크기

## Zustand 설치

```bash
npm install zustand
```

## Store 생성

```ts
import { create } from 'zustand'

const useStore = create(set => ({
  bears: 0,

  increasePopulation: () =>
    set(state => ({ bears: state.bears + 1 })),

  removeAllBears: () =>
    set({ bears: 0 })
}))
```

## 컴포넌트에서 사용하기

```tsx
import useStore from './store'

const App = () => {

  const { bears, increasePopulation, removeAllBears } =
    useStore(state => state)

  return (
    <>
      <h1>{bears} around here ...</h1>

      <button onClick={increasePopulation}>
        one up
      </button>

      <button onClick={removeAllBears}>
        remove all
      </button>
    </>
  )
}
```

## Redux Devtools 사용하기

```ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

const store = (set) => ({
  bears: 0,
  increasePopulation: () => set(state => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 })
})

const useStore = create(devtools(store))
```

## Production 환경 분기

```ts
const useStore = create(
  process.env.NODE_ENV !== 'production'
    ? devtools(store)
    : store
)
```

## Zustand 활용 팁

### 1. 상태 일부만 업데이트

```ts
const useStore = create((set) => ({
  bears: 0,
  trees: 10,

  addTree: () => set(state => ({
    trees: state.trees + 1
  })),

  reset: () => set({
    bears: 0,
    trees: 10
  })
}))
```

### 2. Selector로 리렌더링 최적화

```tsx
const BearCount = () => {
  const bears = useStore(state => state.bears)
  return <h1>{bears}</h1>
}
```

### 3. persist 미들웨어

```ts
import { persist } from 'zustand/middleware'

const useStore = create(
  persist(
    (set) => ({
      bears: 0,
      increasePopulation: () =>
        set(state => ({ bears: state.bears + 1 })),
      removeAllBears: () => set({ bears: 0 })
    }),
    { name: 'bear-storage' }
  )
)
```

### 4. Immer 사용

```ts
import { immer } from 'zustand/middleware/immer'

const useStore = create(
  immer((set) => ({
    bears: 0,

    increasePopulation: () =>
      set(state => { state.bears += 1 }),

    removeAllBears: () =>
      set(state => { state.bears = 0 })
  }))
)
```

### 5. 비동기 작업 처리

```ts
const useStore = create((set) => ({
  bears: 0,

  fetchBears: async () => {
    const res = await fetch('/api/bears')
    const data = await res.json()
    set({ bears: data.count })
  }
}))
```

### 6. 여러 store 사용

```ts
// userStore.js
const useUserStore = create(set => ({
  user: null,
  setUser: (user) => set({ user })
}))

// themeStore.js
const useThemeStore = create(set => ({
  theme: 'light',
  toggleTheme: () =>
    set(state => ({
      theme: state.theme === 'light' ? 'dark' : 'light'
    }))
}))
```

### 7. TypeScript 사용

```ts
interface BearState {
  bears: number
  increasePopulation: () => void
  removeAllBears: () => void
}
```

### 8. Devtools + Immer

```ts
const useStore = create(
  devtools(
    immer((set) => ({
      bears: 0,
      increasePopulation: () =>
        set(state => { state.bears += 1 })
    }))
  )
)
```

## 마무리

Zustand는 단순하면서도 강력한 상태 관리 라이브러리입니다. Redux보다 훨씬 적은 코드로 전역 상태를 관리할 수 있으며 필요에 따라 다양한 미들웨어와 함께 확장할 수 있습니다.
