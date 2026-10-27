---
title: "Servlet부터 Filter, Listener까지: Java 웹 요청 처리 흐름 정리"
description: "WAS · Servlet Container · Context부터 Servlet 생명주기, Request/Response, Front Controller, Filter, Listener, 멀티스레드 주의점까지 요청 하나가 처리되는 순서대로 정리한 Java 웹 개념 노트입니다."
date: 2026-10-27
tags: ["Java", "Servlet", "Tomcat", "Maven", "WAS", "Backend", "Spring MVC"]
category: backend
---

Java로 웹 개발을 공부하다 보면 Servlet, WAS, Container, Context처럼 비슷해 보이는 용어가 한꺼번에 나온다. 용어를 하나씩 따로 외우면 금방 섞여서, 이번에는 **브라우저가 보낸 요청이 서버에서 어떻게 처리되는지**를 기준으로 순서대로 정리했다.

```text
브라우저 → Tomcat (Context 선택) → Filter → Servlet / Front Controller → 응답
```

이 한 줄이 글 전체의 뼈대다. 웹 애플리케이션의 기본 구조에서 시작해 Servlet, Front Controller, Filter, Listener를 거쳐 멀티스레드 환경의 주의점까지 이어서 본다.

> **기준 환경!** 예제는 **Java 17 이상, Tomcat 11, Jakarta Servlet 6.1** 기준이다. Tomcat 11은 Java 17 이상을 요구하고 `javax.servlet`이 아니라 `jakarta.servlet` 패키지를 쓴다. 버전별 요구 사항은 [Tomcat 공식 문서](https://tomcat.apache.org/whichversion.html)에서 확인할 수 있다.

## 웹 애플리케이션은 어떻게 동작할까

웹 애플리케이션은 크게 세 가지 역할로 나눌 수 있다.

- **클라이언트**: 사용자가 보는 화면을 제공하고 서버에 요청을 보낸다.
- **서버**: 요청을 처리하고, 필요한 데이터를 조회하거나 저장한 뒤 응답을 보낸다.
- **데이터베이스**: 서비스에서 쓰는 데이터를 저장한다.

로그인 버튼을 눌렀을 때의 흐름으로 보면 이렇다.

```text
1. 사용자가 아이디와 비밀번호를 입력한다.
2. 브라우저가 서버에 로그인 요청을 보낸다.
3. 서버가 요청 데이터를 확인한다.
4. 서버가 데이터베이스에서 회원 정보를 조회한다.
5. 서버가 로그인 결과를 브라우저에 응답한다.
```

HTML · CSS · JavaScript로 화면을 만드는 영역을 **프론트엔드**, 요청 처리와 데이터 관리를 맡는 영역을 **백엔드**라고 부른다. 이 글에서 다루는 Servlet은 백엔드, 그중에서도 "요청을 받아 처리하는 부분"에 해당한다.

### 3계층 아키텍처

역할 기준으로 보면 웹 애플리케이션은 세 계층으로 나눠 생각할 수 있다.

| 계층 | 역할 | 예시 |
| --- | --- | --- |
| Presentation | 사용자에게 화면을 보여주고 입력을 받는다 | HTML, CSS, JavaScript |
| Application | 요청을 처리하고 비즈니스 로직을 수행한다 | Servlet, Java 서비스 코드 |
| Data | 데이터를 저장하고 조회한다 | MySQL, Oracle Database |

계층을 나누면 화면, 비즈니스 로직, 데이터 접근 코드를 따로 관리할 수 있다. 화면 디자인이 바뀌어도 회원 가입 규칙까지 같이 고칠 필요가 없다는 뜻이다.

## WAS, Servlet Container, Context 구분하기

Servlet을 보기 전에 자주 헷갈리는 세 용어부터 구분하고 간다.

### WAS: 웹 애플리케이션을 실행하는 서버

**WAS(Web Application Server)**는 웹 애플리케이션을 실행하고 HTTP 요청을 처리하는 서버 환경이다. Java 웹 개발에서 가장 많이 쓰는 WAS가 **Tomcat**이다.

Tomcat은 Servlet과 JSP를 실행하는 웹 컨테이너다. Jakarta EE 전체 기능을 구현한 풀 프로파일 서버와는 구분된다. 자세한 범위는 [Tomcat 11 문서](https://tomcat.apache.org/tomcat-11.0-doc/index.html)에 정리되어 있다.

### Servlet Container: Servlet을 관리하는 실행 환경

Servlet Container는 개발자가 작성한 Servlet을 생성하고 실행하며 생명주기를 관리한다. 맡는 일은 다음과 같다.

- URL에 맞는 Servlet 찾기
- Servlet 객체 생성과 초기화
- 요청 · 응답 객체 생성
- 요청에 맞는 Servlet 메서드 호출
- Servlet 종료 처리
- 여러 요청을 처리하기 위한 스레드 관리

> **핵심 포인트!** 개발자는 요청을 처리하는 로직만 작성한다. Servlet을 **언제 만들고, 언제 호출하고, 언제 없앨지는 컨테이너가 결정**한다.

### Context: 하나의 웹 애플리케이션

**Context**는 Servlet Container 안에서 실행되는 웹 애플리케이션 하나를 가리킨다. 하나의 Tomcat에서 여러 웹 애플리케이션을 띄울 수 있고, 각각은 서로 구분되는 Context를 가진다.

```text
Tomcat
├── 쇼핑몰 애플리케이션: /shop
├── 게시판 애플리케이션: /board
└── 관리자 애플리케이션: /admin
```

주소 하나를 쪼개 보면 각 부분의 역할이 보인다.

```text
http://localhost:8080/shop/products
```

| 구분 | 값 | 의미 |
| --- | --- | --- |
| 호스트 | `localhost` | 서버 주소 |
| 포트 | `8080` | 서버가 요청을 받는 포트 |
| Context Path | `/shop` | 웹 애플리케이션을 구분하는 경로 |
| Servlet 경로 | `/products` | 해당 애플리케이션 내부의 요청 경로 |

`/shop`으로 어떤 애플리케이션인지 찾고, 그 뒤의 `/products`로 애플리케이션 안에서 처리할 Servlet을 찾는다.

> **짚고 가기!** Context Path가 프로젝트 이름과 항상 같지는 않다. 배포 설정에 따라 달라질 수 있고, 루트 애플리케이션의 Context Path는 빈 문자열이다.

## Maven으로 Servlet 프로젝트 준비하기

Servlet API 같은 외부 라이브러리가 필요해지면 직접 내려받아 버전을 맞추는 일이 금방 번거로워진다. **Maven**은 Java 프로젝트의 의존성과 빌드를 관리하는 도구다.

- 필요한 라이브러리 다운로드
- 라이브러리 버전과 의존 관계 관리
- 프로젝트 빌드, 테스트, 패키징
- 프로젝트 구조 표준화

Maven 프로젝트는 `pom.xml`에 프로젝트 정보와 의존성을 적는다.

### pom.xml 예시

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                             https://maven.apache.org/xsd/maven-4.0.0.xsd">

    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>servlet-study</artifactId>
    <version>1.0.0</version>
    <packaging>war</packaging>

    <properties>
        <maven.compiler.release>17</maven.compiler.release>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <dependency>
            <groupId>jakarta.servlet</groupId>
            <artifactId>jakarta.servlet-api</artifactId>
            <version>6.1.0</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>

</project>
```

| 항목 | 의미 |
| --- | --- |
| `groupId` | 프로젝트 또는 조직을 식별하는 값 |
| `artifactId` | 프로젝트를 식별하는 이름 |
| `version` | 프로젝트 또는 라이브러리 버전 |
| `packaging` | 빌드 결과물의 형태 (웹 애플리케이션은 `war`) |
| `dependencies` | 프로젝트에서 사용하는 라이브러리 목록 |
| `scope` | 의존성이 필요한 범위 |

### Servlet API에 provided를 쓰는 이유

Servlet API는 컴파일할 때는 필요하지만, Tomcat에 배포해서 실행할 때는 Tomcat이 이미 제공한다. 그래서 scope를 `provided`로 지정한다.

```xml
<scope>provided</scope>
```

**컴파일에는 쓰되 실행 환경이 제공하므로 일반적으로 배포 파일(WAR)에는 포함하지 않는다**는 의미다. 이 scope를 포함한 의존성 범위는 [Maven 문서](https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html)에서 볼 수 있다.

## Servlet이란

**Servlet**은 Java로 작성하는 웹 컴포넌트다. Servlet Container 안에서 실행되며 클라이언트의 HTTP 요청을 받아 응답을 만든다.

```text
사용자 요청: /hello
서버 응답: Hello, Servlet!
```

보통 `HttpServlet`을 상속받아 만든다.

```java
package com.example.servlet;

import java.io.IOException;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/hello")
public class HelloServlet extends HttpServlet {

    @Override
    protected void doGet(
            HttpServletRequest request,
            HttpServletResponse response
    ) throws ServletException, IOException {

        response.setContentType("text/plain; charset=UTF-8");
        response.getWriter().println("Hello, Servlet!");
    }
}
```

애플리케이션의 Context Path가 `/servlet-study`라면 다음 주소로 접근한다.

```text
http://localhost:8080/servlet-study/hello
```

### 코드에서 볼 부분

| 코드 | 역할 |
| --- | --- |
| `@WebServlet("/hello")` | `/hello` 요청을 이 Servlet에 연결한다 |
| `doGet(...)` | HTTP GET 요청을 처리한다. POST는 `doPost()`가 맡는다 |
| `setContentType(...)` | 응답 데이터의 형식과 문자 인코딩을 지정한다 |
| `getWriter().println(...)` | 응답 본문에 문자열을 쓴다 |

## Servlet 요청 처리 흐름

브라우저가 Servlet에 요청을 보내면 대략 다음 순서로 처리된다.

```text
브라우저
  ↓ HTTP 요청
Tomcat
  ↓ Context Path 확인
웹 애플리케이션
  ↓ URL 매핑 확인
Servlet
  ↓ 요청 처리
HTTP 응답
  ↓
브라우저
```

단계로 풀어 쓰면 이렇다.

1. 브라우저가 HTTP 요청을 보낸다.
2. Tomcat이 요청을 받는다.
3. Context Path를 기준으로 웹 애플리케이션을 찾는다.
4. 애플리케이션 안에서 URL에 매핑된 Servlet을 찾는다.
5. 컨테이너가 요청 · 응답 객체를 만들어 Servlet에 전달한다.
6. Servlet이 요청을 처리하고 응답을 작성한다.
7. 작성된 응답이 브라우저로 돌아간다.

## URL Mapping

URL Mapping은 **어떤 요청을 어떤 Servlet이 처리할지 연결하는 설정**이다. 방법은 두 가지다.

### 애노테이션으로 설정하기

```java
@WebServlet("/hello")
public class HelloServlet extends HttpServlet {
    // ...
}
```

Servlet 클래스에서 바로 경로를 확인할 수 있어서 가볍게 쓰기 좋다.

### web.xml로 설정하기

`web.xml`은 웹 애플리케이션의 배포 설정 파일이다.

```xml
<servlet>
    <servlet-name>helloServlet</servlet-name>
    <servlet-class>com.example.servlet.HelloServlet</servlet-class>
</servlet>

<servlet-mapping>
    <servlet-name>helloServlet</servlet-name>
    <url-pattern>/hello</url-pattern>
</servlet-mapping>
```

`servlet-name`을 기준으로 Servlet 클래스와 URL 패턴을 이어 준다.

> **주의!** 한 Servlet에는 두 방법 중 하나만 쓰면 된다. 같은 URL을 중복으로 매핑하면 배포 과정에서 충돌이 날 수 있다.

## Servlet 생명주기

Servlet 객체의 생성과 종료는 개발자가 직접 하지 않는다. **Servlet Container가 관리**한다.

```text
Servlet 객체 생성
    ↓
init() 호출
    ↓
service() 호출
    ↓
요청 방식에 따라 doGet(), doPost() 등 호출
    ↓
destroy() 호출
```

| 메서드 | 역할 | 호출 시점 |
| --- | --- | --- |
| `init()` | Servlet 초기화 | 인스턴스 생성 후, 요청을 처리하기 전에 한 번 |
| `service()` | 요청 처리의 진입점 | 요청이 들어올 때마다 |
| `doGet()` | GET 요청 처리 | `service()`가 GET 요청이라고 판단했을 때 |
| `doPost()` | POST 요청 처리 | `service()`가 POST 요청이라고 판단했을 때 |
| `destroy()` | 종료 전 자원 정리 | Servlet이 서비스에서 제거될 때 |

`HttpServlet`의 `service()`는 HTTP 메서드를 확인해서 알맞은 `doXxx()`로 넘겨 주는 역할을 한다. 그래서 보통 `service()`를 직접 오버라이드하지 않고 `doGet()`, `doPost()`만 구현한다.

> **짚고 가기!** Servlet은 **요청마다 새로 만들어지지 않는다.** 일반적으로 컨테이너가 인스턴스를 하나 만들어 두고, 여러 요청을 여러 스레드로 처리한다. 그래서 Servlet의 인스턴스 변수를 쓸 때는 동시성 문제를 고려해야 한다. 이 내용은 뒤의 멀티스레드 부분에서 다시 다룬다.

`init()`이 호출되는 시점은 설정에 따라 다르다. 기본적으로는 컨테이너 판단에 따라 첫 요청 때 초기화될 수 있고, `loadOnStartup`을 지정하면 애플리케이션 시작 시점에 미리 초기화하도록 요청할 수 있다.

```java
@WebServlet(urlPatterns = "/hello", loadOnStartup = 1)
```

## HttpServletRequest: 요청 정보 읽기

`HttpServletRequest`는 클라이언트가 보낸 HTTP 요청 정보를 담고 있다. 여기서 읽을 수 있는 정보는 다음과 같다.

- HTTP 메서드
- 요청 URI
- 요청 파라미터
- 요청 헤더
- 세션
- 요청 속성

### 자주 쓰는 메서드

| 메서드 | 설명 |
| --- | --- |
| `getMethod()` | 요청 메서드 확인 |
| `getRequestURI()` | 요청 URI 확인 |
| `getContextPath()` | Context Path 확인 |
| `getParameter("이름")` | 요청 파라미터 하나 읽기 |
| `getParameterValues("이름")` | 같은 이름의 파라미터 여러 개 읽기 |
| `getHeader("이름")` | 요청 헤더 읽기 |
| `setAttribute("이름", 값)` | 요청 범위에 데이터 저장 |
| `getAttribute("이름")` | 요청 범위에 저장한 데이터 조회 |

### 요청 파라미터 읽기

다음 주소로 요청했다고 하자.

```text
/hello?name=mingyun
```

Servlet에서는 `getParameter()`로 값을 읽는다.

```java
String name = request.getParameter("name");
```

`name`에는 `"mingyun"`이 들어간다. 파라미터는 기본적으로 **문자열**이라서, 숫자가 필요하면 검증한 뒤 `Integer.parseInt()` 같은 메서드로 변환해야 한다.

### parameter와 attribute의 차이

공부하면서 가장 자주 헷갈린 부분이다. 이름이 비슷하지만 값의 출처와 쓰임이 다르다.

| 구분 | Parameter | Attribute |
| --- | --- | --- |
| 주로 누가 설정할까 | 클라이언트 | 서버 |
| 용도 | 사용자가 입력하거나 전달한 값 | 서버 내부에서 전달할 데이터 |
| 읽는 방법 | `getParameter()` | `getAttribute()` |
| 값의 형태 | 문자열 | 객체 |

```java
// 클라이언트가 보낸 값
String name = request.getParameter("name");

// 서버가 요청 객체에 저장하는 값
request.setAttribute("message", "안녕하세요");

// 서버가 저장한 값 읽기
Object message = request.getAttribute("message");
```

## HttpServletResponse: 응답 보내기

`HttpServletResponse`는 서버가 클라이언트에 보낼 HTTP 응답을 설정하는 객체다. 하는 일은 다음과 같다.

- 응답 상태 코드 설정
- 응답 헤더 설정
- Content-Type 설정
- 응답 본문 작성
- 리다이렉트

### 자주 쓰는 메서드

| 메서드 | 설명 |
| --- | --- |
| `setStatus()` | 응답 상태 코드 설정 |
| `setContentType()` | 응답 데이터의 형식과 문자 인코딩 설정 |
| `setHeader()` | 응답 헤더 설정 |
| `getWriter()` | 텍스트 응답 작성 |
| `sendRedirect()` | 다른 URL로 이동하도록 응답 |
| `sendError()` | 오류 상태 코드 전송 |

### 텍스트 응답 예시

```java
response.setStatus(HttpServletResponse.SC_OK);
response.setContentType("text/plain; charset=UTF-8");
response.getWriter().write("요청이 정상적으로 처리되었습니다.");
```

> **주의!** 문자 인코딩은 `getWriter()`를 호출하기 **전에** 설정해야 한다. 이미 Writer를 얻은 뒤에 바꾸면 적용되지 않을 수 있다.

### Content-Type이 필요한 이유

브라우저에 응답 본문을 어떤 형식으로 해석할지 알려 주기 위해서다.

| Content-Type | 의미 |
| --- | --- |
| `text/plain` | 일반 텍스트 |
| `text/html` | HTML 문서 |
| `application/json` | JSON 데이터 |
| `image/jpeg` | JPEG 이미지 |

HTML을 응답할 때는 이렇게 지정한다.

```java
response.setContentType("text/html; charset=UTF-8");
```

## HTTP 메서드와 상태 코드

### HTTP 메서드

| 메서드 | 주로 쓰는 목적 |
| --- | --- |
| GET | 데이터 조회 |
| POST | 데이터 제출 및 생성 요청 |
| PUT | 리소스 전체 교체 |
| PATCH | 리소스 일부 수정 |
| DELETE | 리소스 삭제 |

게시글 기능이라면 이렇게 나눌 수 있다.

```text
GET    /posts        게시글 목록 조회
GET    /posts/1      게시글 상세 조회
POST   /posts        게시글 생성
PUT    /posts/1      게시글 전체 수정
PATCH  /posts/1      게시글 일부 수정
DELETE /posts/1      게시글 삭제
```

GET 요청의 파라미터는 보통 URL의 쿼리 문자열로 전달한다.

```text
/search?keyword=java
```

POST 요청은 데이터를 요청 본문에 담아 보낼 수 있다.

> **짚고 가기!** POST로 보낸다고 데이터가 자동으로 암호화되지는 않는다. 민감한 정보는 반드시 HTTPS로 전송해야 한다.

### 자주 보는 상태 코드

| 상태 코드 | 의미 | 예시 |
| --- | --- | --- |
| `200 OK` | 요청 처리 성공 | 조회 성공 |
| `201 Created` | 리소스 생성 성공 | 게시글 생성 성공 |
| `302 Found` | 다른 위치로 이동 | 로그인 후 페이지 이동 |
| `400 Bad Request` | 요청 값이 잘못됨 | 숫자 자리에 문자열 입력 |
| `401 Unauthorized` | 인증이 필요하거나 인증 실패 | 로그인하지 않은 사용자 |
| `403 Forbidden` | 접근 권한이 없음 | 일반 사용자의 관리자 페이지 접근 |
| `404 Not Found` | 요청한 리소스를 찾을 수 없음 | 존재하지 않는 URL |
| `405 Method Not Allowed` | 해당 HTTP 메서드를 허용하지 않음 | GET만 지원하는 곳에 POST 요청 |
| `500 Internal Server Error` | 서버 내부 오류 | 처리 중 예외 발생 |

## 예제: 두 수를 더하는 Servlet

지금까지 본 Request, Response, 상태 코드를 한 번에 써 보는 예제로 덧셈 기능을 만들어 본다.

### 숫자를 입력받는 HTML

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>덧셈 계산기</title>
</head>
<body>
    <h1>두 숫자 더하기</h1>

    <form action="add" method="get">
        <input type="number" name="a" required>
        <span>+</span>
        <input type="number" name="b" required>

        <button type="submit">계산하기</button>
    </form>
</body>
</html>
```

`name` 속성이 서버로 전달되는 파라미터 이름이 된다.

```html
<input type="number" name="a">
```

여기에 `10`을 입력하면 요청에 `a=10`이 담긴다.

### 계산하는 Servlet

```java
package com.example.servlet;

import java.io.IOException;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/add")
public class AddServlet extends HttpServlet {

    @Override
    protected void doGet(
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException {

        response.setContentType("text/plain; charset=UTF-8");

        String aParam = request.getParameter("a");
        String bParam = request.getParameter("b");

        try {
            int a = Integer.parseInt(aParam);
            int b = Integer.parseInt(bParam);

            long result = (long) a + b;

            response.getWriter().println(a + " + " + b + " = " + result);

        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("정수 두 개를 입력해 주세요.");
        }
    }
}
```

다음과 같이 요청하면

```text
/add?a=10&b=20
```

이런 응답을 받는다.

```text
10 + 20 = 30
```

짚어 둘 부분이 두 가지다.

- 파라미터는 문자열이므로 `Integer.parseInt()`로 변환하고, 변환에 실패하면 `400 Bad Request`로 응답한다.
- 두 `int`의 합이 `int` 범위를 넘을 수 있어서 더하기 전에 `long`으로 바꿨다.

## Front Controller 패턴

기능이 늘어나면 Servlet도 같이 늘어난다.

```text
/login   → LoginServlet
/join    → JoinServlet
/posts   → PostServlet
```

Servlet마다 로깅, 요청 확인, 인증 같은 작업을 반복하면 코드가 중복되기 쉽다. 이때 쓰는 구조가 **Front Controller 패턴**이다.

### Front Controller란

클라이언트의 요청을 **하나의 진입점에서 먼저 받은 뒤**, 요청 종류에 따라 알맞은 처리 로직으로 나눠 주는 패턴이다.

```text
클라이언트 요청
       ↓
Front Controller
       ↓
요청 종류 확인
       ↓
각 기능 담당 코드 실행
       ↓
응답
```

### 간단한 예시

```java
package com.example.controller;

import java.io.IOException;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/main")
public class MainController extends HttpServlet {

    @Override
    protected void doGet(
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException {

        response.setContentType("text/plain; charset=UTF-8");

        String action = request.getParameter("action");

        if (action == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("action 값이 필요합니다.");
            return;
        }

        switch (action) {
            case "home":
                response.getWriter().println("홈 화면 요청");
                break;

            case "list":
                response.getWriter().println("목록 조회 요청");
                break;

            default:
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                response.getWriter().println("존재하지 않는 요청입니다.");
        }
    }
}
```

요청은 이렇게 보낸다.

```text
/main?action=home
/main?action=list
```

### 장점과 한계

- 요청 처리의 시작점을 하나로 통일할 수 있다.
- 공통으로 필요한 처리 로직을 한곳에 모으기 쉽다.
- 기능별 코드의 책임을 나눌 수 있다.

다만 위 예시처럼 기능을 `switch`문에 계속 추가하면 Controller 자체가 비대해진다. 실제 프로젝트라면 요청별 처리 로직을 별도 클래스나 메서드로 분리하는 편이 낫다.

> **짚고 가기!** Spring MVC의 `DispatcherServlet`도 모든 요청을 먼저 받아 알맞은 처리 대상으로 연결한다. Front Controller 패턴을 이해해 두면 `DispatcherServlet`을 볼 때 바로 연결된다.

## Filter: 요청과 응답 사이의 공통 처리

**Filter**는 Servlet이나 다른 웹 리소스에 도달하기 전후에 요청과 응답을 가로채 공통 작업을 수행하는 컴포넌트다. 주로 이런 일에 쓴다.

- 로그인 여부 확인
- 접근 권한 확인
- 요청 · 응답 로깅
- 문자 인코딩 설정
- 요청과 응답을 감싸서 추가 처리

### Filter Chain

Filter는 여러 개를 연결할 수 있다.

```text
요청
 ↓
Filter A
 ↓
Filter B
 ↓
Servlet
 ↓
Filter B의 후처리
 ↓
Filter A의 후처리
 ↓
응답
```

각 Filter에서 `chain.doFilter()`를 호출하면 다음 Filter, 또는 마지막 Servlet으로 처리가 넘어간다.

> **핵심 포인트!** `chain.doFilter()`를 기준으로 앞쪽 코드는 **Servlet 실행 전 처리**, 뒤쪽 코드는 **Servlet 실행 후 처리**가 된다.

```java
// Servlet 실행 전 처리

chain.doFilter(request, response);

// Servlet 실행 후 처리
```

### 요청 처리 시간을 측정하는 Filter

```java
package com.example.filter;

import java.io.IOException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebFilter("/*")
public class LoggingFilter extends HttpFilter {

    @Override
    protected void doFilter(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain
    ) throws IOException, ServletException {

        long start = System.currentTimeMillis();

        System.out.println("요청 URI: " + request.getRequestURI());

        try {
            // 다음 Filter 또는 Servlet으로 요청을 전달한다.
            chain.doFilter(request, response);
        } finally {
            long elapsed = System.currentTimeMillis() - start;
            System.out.println("처리 시간: " + elapsed + "ms");
        }
    }
}
```

`try-finally`로 감싼 이유는 Servlet에서 예외가 나더라도 처리 시간 로그가 남도록 하기 위해서다. 이 예제는 일반적인 동기 요청 흐름을 기준으로 시간을 잰다. 비동기 요청까지 정확하게 측정하려면 별도 처리가 필요하다.

### chain.doFilter()를 호출하지 않으면

다음 Filter나 Servlet으로 요청이 넘어가지 않는다. 이 성질을 이용해 인증되지 않은 요청을 중간에서 막을 수 있다.

```java
if (로그인하지_않은_사용자) {
    response.sendRedirect(request.getContextPath() + "/login");
    return;
}

chain.doFilter(request, response);
```

> **주의!** 실제 로그인 Filter에서는 로그인 페이지나 정적 리소스까지 무조건 막지 않도록 적용 경로를 조절해야 한다. 그렇지 않으면 로그인 페이지로 이동하는 요청이 다시 Filter에 걸려 리다이렉트가 끝없이 반복될 수 있다.

### Filter의 실행 순서

Filter를 여러 개 쓸 때 실행 순서가 중요하면 `@WebFilter`만으로는 순서를 정할 수 없다. 애노테이션으로 등록한 Filter 사이의 순서는 스펙에서 정해 두지 않았고, `web.xml`에 선언한 순서대로 실행된다. 순서가 중요하다면 `web.xml`에 명시하는 방식을 쓴다.

### Front Controller와 Filter의 차이

| 구분 | Front Controller | Filter |
| --- | --- | --- |
| 주요 역할 | 요청을 알맞은 기능으로 분기 | 요청 · 응답에 공통 처리 적용 |
| 대표 작업 | 요청 분석, 처리 대상 선택 | 인증, 로깅, 인코딩 |
| 위치 | 애플리케이션의 요청 처리 진입점 | Servlet 등 대상 실행 전후 |

둘은 경쟁 관계가 아니라 함께 쓴다.

```text
요청 → Filter → Front Controller → 기능별 처리
```

### XSS와 Filter

XSS는 악성 스크립트가 웹 페이지에 삽입되어 다른 사용자의 브라우저에서 실행되는 문제다. Filter로 입력값을 점검하거나 요청 객체를 감싸서 처리할 수는 있다.

> **주의!** 문자 몇 개를 일괄 치환하는 방식만으로는 XSS를 완전히 막을 수 없다. 데이터를 HTML 본문, 속성, JavaScript 중 어디에 출력하는지에 맞춰 이스케이프하고, 검증된 라이브러리와 보안 정책을 함께 써야 한다.

## Listener: 웹 애플리케이션의 이벤트 감지

**Listener**는 웹 애플리케이션에서 발생하는 특정 이벤트를 감지해서 그에 맞는 작업을 수행한다. 감지할 수 있는 이벤트는 다음과 같다.

- 웹 애플리케이션 시작과 종료
- 세션 생성과 종료
- 요청 생성과 종료
- Context, Session, Request의 속성 변경

### ServletContextListener

웹 애플리케이션이 시작되고 종료되는 시점을 감지할 때 쓴다.

```java
package com.example.listener;

import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;
import jakarta.servlet.annotation.WebListener;

@WebListener
public class AppLifecycleListener implements ServletContextListener {

    @Override
    public void contextInitialized(ServletContextEvent event) {
        System.out.println("웹 애플리케이션이 시작되었습니다.");

        // 필요한 초기화 작업을 수행한다.
    }

    @Override
    public void contextDestroyed(ServletContextEvent event) {
        System.out.println("웹 애플리케이션이 종료됩니다.");

        // 생성한 자원이 있다면 정리한다.
    }
}
```

`@WebListener`를 붙이면 Listener로 등록된다. `web.xml`에 등록하는 방법도 있다. 애플리케이션이 시작될 때 한 번만 해 두면 되는 초기화(설정 로딩, 커넥션 풀 준비 등)와 종료 시 자원 정리를 넣기에 알맞은 자리다.

### Filter와 Listener의 차이

| 구분 | Filter | Listener |
| --- | --- | --- |
| 관심 대상 | 요청과 응답의 처리 과정 | 애플리케이션에서 발생하는 이벤트 |
| 대표 용도 | 인증, 로깅, 인코딩 | 시작 · 종료 감지, 세션 이벤트 처리 |
| 실행 시점 | 매핑된 요청의 처리 전후 | 해당 이벤트가 발생했을 때 |

## Servlet과 멀티스레드

Servlet에서 가장 조심해야 하는 부분이 **멀티스레드 환경**이다. 여러 사용자가 동시에 요청하면 컨테이너는 여러 스레드로 요청을 처리한다. 이때 여러 스레드가 **같은 Servlet 인스턴스의 필드**에 동시에 접근하면 문제가 생긴다.

### 문제가 되는 코드

```java
@WebServlet("/example")
public class ExampleServlet extends HttpServlet {

    // 여러 요청이 공유하는 인스턴스 변수
    private String userName;

    @Override
    protected void doGet(
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException {

        userName = request.getParameter("name");

        // 다른 요청이 동시에 userName을 바꿀 수 있다.
        response.getWriter().println(userName);
    }
}
```

두 사용자가 거의 동시에 요청하면 이런 일이 벌어질 수 있다.

```text
사용자 A: userName = "민균"
사용자 B: userName = "지수"
사용자 A의 응답: "지수"
```

A가 값을 저장한 뒤 응답하기 전에 B가 같은 필드를 덮어쓰기 때문이다.

### 지역 변수로 관리하기

요청마다 필요한 값은 메서드의 지역 변수로 다루는 것이 기본이다.

```java
@WebServlet("/example")
public class ExampleServlet extends HttpServlet {

    @Override
    protected void doGet(
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException {

        response.setContentType("text/plain; charset=UTF-8");

        // 요청 처리 중에만 쓰는 지역 변수
        String userName = request.getParameter("name");

        response.getWriter().println(userName);
    }
}
```

지역 변수는 스레드마다 따로 존재하므로 요청끼리 값이 섞이지 않는다.

### 공유 데이터가 꼭 필요하다면

용도에 맞는 동시성 처리 방법을 고른다.

- 불변 객체 사용
- 동시성 컬렉션 사용
- `AtomicInteger` 같은 원자적 연산 도구 사용
- 필요한 범위에서만 동기화
- 데이터베이스의 트랜잭션과 제약 조건 활용

> **짚고 가기!** `synchronized`를 모든 곳에 걸면 요청이 순차 처리되어 성능이 떨어질 수 있다. 또 서버가 여러 대인 환경에서는 한 JVM 안의 동기화만으로 전체 데이터 정합성을 보장할 수 없다.

## 전체 흐름으로 다시 정리하기

지금까지 본 개념을 하나의 요청 흐름으로 이어 본다.

```text
1. 브라우저가 HTTP 요청을 보낸다.

2. Tomcat이 요청을 받는다.

3. Context Path를 기준으로 웹 애플리케이션을 찾는다.

4. 요청에 매핑된 Filter가 있다면 먼저 실행한다.
   - 로그인 확인
   - 로깅
   - 공통 요청 처리

5. URL에 맞는 Servlet 또는 Front Controller가 실행된다.

6. HttpServletRequest에서 요청 정보를 읽는다.

7. 필요한 비즈니스 로직과 데이터 처리를 수행한다.

8. HttpServletResponse에 상태 코드와 응답 본문을 작성한다.

9. Filter의 후처리를 거쳐 클라이언트에 응답한다.
```

Listener는 이 요청 흐름에 매번 끼어들지 않는다. **자신이 감지하도록 등록된 이벤트가 발생했을 때** 실행된다.

### 핵심 개념 한눈에 보기

| 개념 | 핵심 역할 |
| --- | --- |
| Tomcat | Java 웹 애플리케이션을 실행하고 HTTP 요청을 처리하는 서버 |
| Servlet Container | Servlet의 생성, 실행, 생명주기를 관리하는 환경 |
| Context | 컨테이너에서 실행되는 하나의 웹 애플리케이션 |
| Maven | 의존성, 빌드, 패키징을 관리하는 도구 |
| Servlet | HTTP 요청을 처리하고 응답을 만드는 Java 웹 컴포넌트 |
| Request | 클라이언트가 보낸 요청 정보를 담는 객체 |
| Response | 클라이언트에 보낼 응답을 설정하는 객체 |
| Front Controller | 요청을 한곳에서 받아 기능별 처리로 분기하는 패턴 |
| Filter | 요청과 응답에 공통 처리를 적용하는 컴포넌트 |
| Listener | 웹 애플리케이션의 특정 이벤트를 감지하는 컴포넌트 |

## 정리

- 요청 하나는 **Tomcat → Context → Filter → Servlet(Front Controller) → 응답** 순서로 흐른다.
- Servlet의 생성 · 호출 · 소멸은 **컨테이너가 관리**하고, 개발자는 `doGet()` · `doPost()`에 요청 처리 로직을 쓴다.
- Servlet 인스턴스는 **하나를 여러 스레드가 공유**하므로, 요청별 값은 지역 변수에 둔다.
- Filter는 **요청 · 응답의 앞뒤**에서, Listener는 **이벤트가 발생했을 때** 동작한다.

용어를 따로 외우기보다 **요청이 들어와 응답이 나갈 때까지 각 구성 요소가 어디서 무슨 일을 하는지**를 잡아 두는 것이 가장 중요했다. 이 흐름을 기억해 두면 이후 Spring MVC의 Controller, Filter, `DispatcherServlet`을 공부할 때도 같은 구조 위에서 이어서 이해할 수 있다.
