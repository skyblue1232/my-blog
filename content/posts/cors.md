---
title: "CORS와 SOP 완벽 이해하기"
description: "브라우저 보안 정책인 CORS와 SOP의 개념과 동작 방식을 쉽게 설명합니다."
date: 2025-01-12
tags: ["Web", "HTTP", "Security", "CORS"]
category: backend
---

프론트엔드 개발을 하다 보면 API 요청을 보낼 때 다음과 같은 에러를 자주 보게 됩니다.

```text
Access to fetch at 'https://api.example.com'
from origin 'http://localhost:3000'
has been blocked by CORS policy
```

이 에러의 원인은 바로 **CORS**와 **SOP (Same-Origin Policy)** 때문입니다.

이 글에서는

- SOP가 무엇인지
- CORS는 왜 필요한지
- CORS는 어떻게 동작하는지

를 이해하기 쉽게 정리합니다. ---

## 1. Origin (출처)

웹에서 <strong>출처(Origin)</strong>는 다음 세 가지 요소로 구성됩니다.

- Protocol (프로토콜)
- Host (도메인)
- Port (포트)

```text
https://example.com:3000
```

| 구성 요소 | 값 |
| --- | --- |
| Protocol | `https` |
| Host | `example.com` |
| Port | `3000` |

이 세 요소가 모두 동일해야 **동일 출처**입니다.

```js
console.log(location.origin)
```

\---

## 2. SOP (Same-Origin Policy)

**SOP는 동일 출처 정책**입니다.

브라우저는 보안을 위해 **다른 출처의 리소스 접근을 기본적으로 차단**합니다.

예를 들어

```text
Frontend
http://localhost:3000

Backend
https://api.example.com
```

이 두 서버는 **출처가 다르기 때문에** 브라우저는 요청을 차단합니다.

이 정책이 존재하는 이유는 악성 스크립트가 다른 사이트의 데이터를 몰래 가져가는 것을 방지하기 위함입니다.

중요한 점은

**SOP 검사는 서버가 아니라 브라우저가 수행합니다.**

\---

## 3. CORS (Cross-Origin Resource Sharing)

CORS는 **다른 출처의 리소스를 허용하기 위한 규칙**입니다.

즉,

**SOP 정책을 유지하면서 특정 요청만 허용하는 방법**입니다.

동작 방식은 다음과 같습니다.

1. 브라우저가 요청을 보냄 (Origin 포함)
2. 서버가 응답 헤더에 허용 Origin을 포함
3. 브라우저가 허용 여부 확인

```http
Access-Control-Allow-Origin
```

예

```http
Access-Control-Allow-Origin: https://example.com
```

또는

```http
Access-Control-Allow-Origin: *
```

\---

## 4. CORS 동작 방식

CORS 요청은 크게 3가지 방식으로 동작합니다. ---

### 1. Preflight Request

브라우저는 실제 요청 전에 **OPTIONS 요청을 먼저 보내 서버 허용 여부를 확인**합니다.

```http
OPTIONS /api/users
```

이 요청을 **Preflight 요청**이라고 합니다.

이 방식은 보안을 강화하지만 추가 요청이 발생하기 때문에 성능에 영향을 줄 수 있습니다.

\---

### 2. Simple Request

특정 조건을 만족하면 Preflight 요청 없이 바로 요청을 보냅니다.

조건:

- GET / POST / HEAD 메소드
- 특정 Content-Type
- 특정 헤더만 사용

하지만 실제 API 요청 대부분은 **Preflight 요청이 발생합니다.** ---

### 3. Credentialed Request

쿠키나 인증 토큰을 포함하는 요청입니다.

예

```text
fetch("https://example.com/api", {
credentials: "include"
})
```

axios

```text
axios.get("/api", {
withCredentials: true
})
```

이 경우 서버도 다음 헤더를 설정해야 합니다.

```http
Access-Control-Allow-Credentials: true
```

그리고 중요한 점은

**Credential 요청에서는 Access-Control-Allow-Origin에 "\*"를 사용할 수 없습니다.**

\---

## 5. CORS 해결 방법

가장 올바른 해결 방법은 **서버에서 CORS 설정을 하는 것**입니다. 예 (Express)

```ts
const cors = require("cors")

app.use(cors({
origin: "http://localhost:3000",
credentials: true
}))
```

Spring

```text
@Configuration
public class WebConfig implements WebMvcConfigurer {

@Override
public void addCorsMappings(CorsRegistry registry) {
registry.addMapping("/**")
.allowedOrigins("http://localhost:3000")
.allowedMethods("GET","POST")
.allowCredentials(true);
}
}
```

\---

## 6. 개발 환경에서 임시 해결 방법

다음 방법들은 \*\*개발 환경에서만 사용해야 합니다.\*\*

- 프록시 서버 사용
- Chrome CORS 확장 프로그램
- API Gateway 사용

하지만 **실제 서비스에서는 반드시 서버에서 CORS를 설정해야 합니다.** ---

## 정리

- SOP는 보안을 위해 다른 출처 요청을 차단한다
- CORS는 특정 요청을 허용하기 위한 규칙이다
- CORS 검사는 브라우저가 수행한다
- 해결은 서버 설정이 필요하다

CORS 에러는 단순한 에러가 아니라 웹 보안을 위한 중요한 정책입니다.
