---
title: "Spring MVC 상세 정리 — Model·View·Controller에서 HTTP 응답까지"
description: "상품 상세 요청으로 MVC의 책임을 나누고, DispatcherServlet, JSP 렌더링, 요청 바인딩, 리다이렉트, MockMvc, 예외 처리와 파일 업로드를 살펴봅니다."
date: 2026-11-18
tags: ["Java", "Spring MVC", "Spring Boot", "JSP", "Backend"]
category: backend
---

## MVC에서 코드를 어디에 둘까

MVC(Model–View–Controller)는 사용자 인터페이스가 있는 애플리케이션을 **업무 상태와 규칙을 다루는 Model**, **결과를 표현하는 View**, **입력을 받아 처리를 연결하는 Controller**로 나누는 패턴이다. 상품 상세 페이지에서 공개 여부를 판정하는 규칙, 가격을 표시하는 형식, URL에서 상품 ID를 읽는 처리는 서로 다른 이유로 바뀐다. 각 코드를 어디에 둘지 헷갈릴 때는 변경 이유를 기준으로 보면 구분하기 쉽다. 같은 상품 상세 요청을 따라가며 업무 규칙, 화면 표현, HTTP 처리가 어디서 만나는지 살펴보자. 요청이 서블릿에 도달하기까지의 과정은 [Java 웹 요청 처리 흐름 정리](/blog/java-servlet-request-flow)에서 이어 볼 수 있다.

| 역할 | 핵심 질문 | 상품 상세 및 주문 예시 |
| --- | --- | --- |
| **Model** | 어떤 상태를 관리하고 어떤 업무 규칙을 적용하는가? | 판매 상품을 조회하고, 주문 가능 여부를 판단한다. |
| **View** | 결과를 사용자에게 어떻게 보여주는가? | 상품 이름과 가격을 표시하고, 주문 가능 여부에 따라 버튼 상태를 바꾼다. |
| **Controller** | 이 입력에 어떤 작업을 실행하고 어떤 응답으로 돌려주는가? | URL에서 상품 ID를 받아 조회를 요청하고, 상세 화면이나 `404`로 연결한다. |

## Model(모델) — 업무 상태와 규칙

Model은 애플리케이션이 다루는 **데이터, 상태, 그리고 그 상태에 적용되는 업무 규칙**을 표현한다. 쇼핑몰이라면 상품 가격과 재고가 상태이고, “판매 중인 상품만 주문할 수 있다”, “주문 수량은 재고를 초과할 수 없다”가 업무 규칙이다.

- **업무 정보를 표현한다.** `Product`는 상품의 이름, 가격, 판매 상태, 재고를 표현할 수 있다. `Order`는 주문 상품과 수량, 주문 상태를 가지고 결제나 취소에 따른 상태 변경을 표현할 수 있다.
- **업무 규칙을 적용한다.** 상품이 판매 중이고 재고가 있으면 상세 화면의 주문 버튼을 활성화할 수 있다. 실제 주문을 생성할 때는 요청 수량과 그 시점의 판매 상태·재고를 다시 확인한다. 상세 화면을 본 뒤 재고가 바뀔 수 있기 때문이다.
- **필요한 데이터를 조회하고 상태를 갱신한다.** 계층형 Spring 애플리케이션에서는 보통 서비스가 상품 조회나 주문 생성 같은 작업을 수행하고, 도메인 객체가 업무 규칙을 표현하며, 리포지토리가 DB 조회·저장을 맡는다. 예를 들어 `ProductService`가 `ProductRepository`에서 상품을 가져오고, 상품의 공개 정책을 적용해 조회 결과를 만든다.

데이터베이스는 데이터를 저장하는 수단이다. 상품을 메모리에서 조회하더라도 상품의 상태와 주문 규칙을 다루는 Model은 존재한다. MVC에서 Model이 가리키는 범위는 프로젝트에 따라 달라질 수 있다. 위 예제처럼 도메인·서비스·리포지토리를 나눌 수 있으며, MVC 자체는 특정 클래스 구조를 요구하지 않는다.

## View(뷰) — 사용자에게 보이는 표현

View는 **주어진 데이터를 화면에 어떻게 보여줄지** 결정한다. 서버에서 HTML을 만드는 웹 애플리케이션에서는 Thymeleaf나 JSP 템플릿이 View 역할을 할 수 있다. 템플릿은 전달받은 값을 HTML에 넣고, 목록을 반복 렌더링하며, 값에 따라 요소의 표시나 스타일을 바꾼다.

- **데이터에 표시 형식을 적용한다.** 가격 `25000`을 `25,000원`으로 표시하고, 상품이 여러 개라면 동일한 형태의 카드로 나열한다.
- **상태에 맞는 UI를 보여준다.** `orderable` 값이 `false`이면 주문 버튼을 비활성화하고 `주문 불가` 문구를 표시할 수 있다. 버튼 표시 방식은 View가 담당하고, `orderable`의 근거가 되는 판매·재고 규칙은 Model 쪽에서 관리한다.
- **사용자 입력을 위한 화면을 구성한다.** 상품 수량 입력칸과 주문 버튼을 배치하고, 검증 오류가 전달되면 해당 입력칸 근처에 메시지를 표시한다. 실제 주문 요청은 서버에서도 검증한다. 사용자는 화면을 거치지 않고 HTTP 요청을 보낼 수 있기 때문이다.

표현 자체에 필요한 조건문과 반복문은 View에 자연스럽게 들어간다. 반면 상품 공개 여부나 할인 조건을 템플릿마다 계산하면 화면마다 판단이 달라질 수 있으므로, 계산 결과를 전달받아 표현하는 편이 일관성을 유지하기 쉽다.

## Controller(컨트롤러) — 입력과 응답을 연결

Controller는 **사용자 입력을 해석하고, 필요한 작업을 호출한 뒤, 결과를 응답으로 연결**한다. 웹에서는 URL, HTTP 메서드, 경로 변수, 쿼리 파라미터, 요청 본문 등이 입력이다.

- **요청 값을 처리한다.** `GET /products/42`의 `42`를 상품 ID로 받아 서비스에 전달한다. Spring MVC에서는 `@GetMapping`이 요청 경로와 메서드를 선언하고 `@PathVariable`이 경로 값을 메서드 인자로 바인딩한다.
- **요청에 맞는 작업을 호출한다.** 상세 요청은 상품 조회로, 주문 요청은 주문 생성으로 연결한다. 업무 처리를 서비스에 위임하면 HTML 화면과 JSON API가 같은 상품 공개 정책을 사용할 수 있다.
- **처리 결과를 HTTP 응답으로 연결한다.** 조회에 성공하면 상품 정보를 모델 속성에 담고 상세 뷰를 선택한다. 사용자에게 보여줄 수 있는 상품을 찾지 못했다면 예제에서는 `404 Not Found`로 처리한다. 공통 오류 매핑은 별도 예외 처리기에도 둘 수 있다.

Controller가 판단할 사항에는 입력을 읽는 방식과 응답 선택이 포함된다. 예를 들어 `"abc"`를 정수형 상품 ID로 바인딩할 수 없는 문제는 웹 입력 경계에서 처리한다. “회원 등급에 따라 이 상품을 주문할 수 있는가?”처럼 같은 주문 경로라면 어디서든 적용해야 하는 조건은 업무 규칙으로 관리한다.

## 웹 요청의 흐름 — `GET /products/42`

```text
브라우저 ── GET /products/42 ──→ DispatcherServlet
DispatcherServlet ── 핸들러 매핑과 실행 ──→ Controller
Controller ←── 상품 조회 결과 ── ProductService
Controller ── 모델 속성 + 뷰 이름 ──→ DispatcherServlet
DispatcherServlet ── 뷰 해석과 렌더링 ──→ HTML 응답
```

1. **브라우저**가 `GET /products/42`를 보낸다.
2. **웹 프레임워크**가 경로와 HTTP 메서드에 맞는 Controller 메서드를 찾는다.
3. **Controller**가 `42`를 상품 ID로 받아 상품 조회 작업을 호출한다.
4. **서비스**가 상품을 조회하고 공개 정책을 적용한다. 조회 결과에는 화면에 필요한 상품 이름, 가격, 주문 가능 여부 등이 담긴다.
5. **Controller**가 조회 결과를 화면에 전달할 데이터로 준비하고 상세 뷰를 선택한다.
6. **View**가 데이터를 사용해 HTML을 렌더링하고, 서버가 HTTP 응답으로 보낸다.

| 변경 요구 | 주로 바뀌는 곳 | 이유 |
| --- | --- | --- |
| 가격의 천 단위 구분이나 버튼 배치 변경 | View 또는 화면용 포맷터 | 데이터의 표현 방식이 바뀐다. |
| 예약 판매 상품의 주문 가능 조건 변경 | Model 쪽의 도메인·서비스 | 주문 가능 여부를 판단하는 정책이 바뀐다. |
| 상세 페이지 경로를 `/catalog/products/{id}`로 변경 | Controller의 요청 매핑과 해당 URL을 사용하는 링크 | 요청을 처리하는 주소가 바뀐다. |

이 순서는 서버 렌더링 웹 MVC 예시다. 데스크톱 GUI에서는 Controller가 클릭 같은 입력 이벤트를 처리하고, View가 Model의 상태 변경 알림을 받아 화면을 갱신하는 구조도 가능하다. 구현에 따라 역할 간 상호작용은 달라질 수 있다.

## Spring MVC 적용 사례

### `DispatcherServlet`이 요청을 처리하는 방식

`DispatcherServlet`은 Spring MVC의 **프런트 컨트롤러(Front Controller)**다. 여러 요청을 공통 진입점에서 받고, 매핑과 실행·렌더링을 담당하는 구성 요소에 위임한다. `ProductPageController`는 이 흐름에서 특정 상품 요청을 처리하는 애플리케이션 컨트롤러다. [Spring 공식 문서 — 요청 처리 과정](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet/sequence.html)

1. `DispatcherServlet`은 `HandlerMapping`을 통해 `GET /products/42`에 대응하는 핸들러를 찾는다.
2. `HandlerAdapter`는 경로 값을 메서드 인자로 준비하고 해당 Controller 메서드를 호출한다.
3. Controller는 조회 결과를 `Model` 속성에 추가하고 논리 뷰 이름 `products/detail`을 반환한다.
4. `DispatcherServlet`은 `ViewResolver`를 통해 이름에 해당하는 `View`를 찾고, `View`는 모델 속성을 사용해 응답을 렌더링한다. [Spring 공식 문서 — DispatcherServlet의 구성 요소](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet/special-bean-types.html)

### HTML 상세 페이지 코드

아래는 Spring Boot의 Thymeleaf 기본 템플릿 경로를 사용하는 코드 조각이다. 예제의 `ProductService.findVisibleProduct(long id)`는 공개 가능한 상품을 찾아 `Optional<ProductDetail>`을 반환하는 서비스 메서드다. `ProductDetail`은 `name()`, `price()`, `orderable()`로 값을 읽을 수 있는 Java `record`라고 가정한다. [Spring 공식 가이드 — Spring MVC와 Thymeleaf](https://spring.io/guides/gs/serving-web-content/)

```java
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.server.ResponseStatusException;

@Controller
public class ProductPageController {
    private final ProductService productService;

    public ProductPageController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/products/{id}")
    public String detail(@PathVariable("id") long id, Model model) {
        ProductDetail product = productService.findVisibleProduct(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        model.addAttribute("product", product);
        return "products/detail";
    }
}
```

`src/main/resources/templates/products/detail.html`의 일부는 다음과 같다.

```html
<h1 th:text="${product.name()}">상품 이름</h1>
<p th:text="|${#numbers.formatInteger(product.price(), 1, 'COMMA')}원|">25,000원</p>
<p th:if="${!product.orderable()}">현재 주문할 수 없습니다.</p>
```

서비스는 공개 가능한 상품과 주문 가능 여부를 판단한다. Controller는 조회 결과를 `product`라는 이름으로 등록하고 뷰를 선택한다. 템플릿은 이 값들을 읽어 가격 형식을 적용하고, 주문할 수 없을 때 안내 문구를 표시한다.

### `Model` 파라미터와 JSON 응답

- **MVC의 Model**은 애플리케이션의 업무 상태와 규칙을 다루는 개념이다. **`org.springframework.ui.Model`**은 뷰 렌더링에 사용할 이름 있는 속성을 담는 Spring 인터페이스다. `model.addAttribute("product", product)`는 조회 결과를 템플릿에서 `product`로 읽을 수 있게 만든다. [Spring 공식 문서 — Controller 반환값과 모델 속성](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/return-types.html)
- **`@Controller`에서 뷰 이름 반환** 방식으로 위 페이지를 제공할 수 있다. `@ResponseBody`를 붙인 메서드나 `@RestController`를 사용하면 메서드 반환값이 응답 본문으로 처리된다. 예를 들어 `GET /api/products/42`에서 DTO를 반환하면, JSON 응답이 선택되고 적절한 `HttpMessageConverter`가 구성된 경우 DTO를 JSON으로 직렬화한다. 일반적인 `@ResponseBody` 경로는 뷰 이름 해석이나 HTML 템플릿 렌더링을 거치지 않는다. [Spring 공식 문서 — `@ResponseBody`](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/responsebody.html)

## Spring MVC 초기화, 요청 매핑과 JSP 응답

### Spring AOP와 프록시의 한계

로깅, 트랜잭션, 성능 모니터링처럼 여러 업무 메서드에 걸쳐 필요한 **횡단 관심사**를 AOP(관점 지향 프로그래밍)로 모듈화하면 서비스가 업무 로직에 집중할 수 있다.

| 용어 | 의미 | 로그 예시 |
| --- | --- | --- |
| Target | 적용 대상 객체 | 서비스 빈 |
| Join point | Advice가 실행될 수 있는 지점. Spring AOP에서는 메서드 실행 | 서비스 메서드 실행 |
| Pointcut | 적용할 join point를 고르는 조건 | `set*` 형태의 메서드 실행 선택 |
| Advice | 해당 지점에서 실행할 동작 | `@Before`로 메서드 실행 전에 로그 기록 |
| Aspect | 횡단 관심사를 묶은 모듈 | 로깅 pointcut과 advice를 묶은 클래스 |
| Weaving | Aspect를 대상에 적용하는 과정 | Spring AOP에서 호출을 가로채는 프록시 구성 |

Advice는 실행 시점에 따라 `@Before`, `@After`, `@AfterReturning`, `@AfterThrowing`, `@Around` 등을 사용한다. `@Async` 예제는 `@EnableAsync`로 활성화하며, Spring의 `TaskExecutor`가 작업 실행을 맡는다. `ThreadPoolTaskExecutor`는 스레드 풀을 사용하고, `SimpleAsyncTaskExecutor`는 일반적으로 작업마다 새 스레드를 만들며, `SyncTaskExecutor`는 호출 스레드에서 실행한다. `@Cacheable("guguCache")` 예제는 `@EnableCaching`으로 활성화하며, 같은 캐시 키로 호출해 캐시에 값이 있으면 저장된 구구단 결과를 사용한다. 실제 저장 방식은 설정된 캐시 구현에 따른다.

**자기 호출**에 주의한다. 빈 외부에서 프록시를 통해 호출하면 설정된 부가 기능이 적용될 수 있다. 같은 대상 객체의 `methodB()`가 내부에서 `methodA()`를 직접 호출하면 그 내부 호출은 프록시를 거치지 않아 `methodA()`에 대한 Advice가 실행되지 않는다. 해당 기능을 별도 빈으로 옮겨 프록시를 통해 호출하면 프록시가 부가 기능을 적용할 수 있다. [Spring 공식 문서 — 프록시와 자기 호출](https://docs.spring.io/spring-framework/reference/core/aop/proxying.html)

### 프런트 컨트롤러와 초기화

- **직접 구현한 Servlet 예제**는 프런트 컨트롤러가 `action` 파라미터를 읽어 `switch`로 분기하고, 개별 핸들러가 서비스 호출·`request.setAttribute()`·JSP forward를 처리한다. **Spring MVC 예제**는 URL과 HTTP 메서드를 선언하고, `DispatcherServlet`이 자신에게 매핑된 요청을 받아 `HandlerMapping`·`HandlerAdapter`·`ViewResolver`에 위임한다. 핸들러는 HTTP 요청을 처리하는 대상이고, 개발자가 작성하는 `@Controller`는 대표적인 예다. 개발자는 서비스·DAO, 화면, 컨트롤러를 구현한다.
- **레거시 구성 예시**에서는 WAS가 `web.xml`을 읽는다. `ContextLoaderListener`가 서비스·리포지토리·DataSource 같은 공용 빈의 루트 컨텍스트를 초기화하고, `DispatcherServlet`이 컨트롤러와 MVC 설정을 담은 자식 컨텍스트를 초기화한다. 자식 컨텍스트에서 루트의 빈을 참조할 수 있다.
- **Spring Boot 구성 예시**에서는 `main()`에서 시작하고, 자동 설정으로 일반적으로 하나의 애플리케이션 컨텍스트에서 업무 빈과 웹 빈을 관리한다. 내장 서블릿 컨테이너에 `DispatcherServlet`이 등록된다. [Spring Boot 공식 문서 — Servlet 웹 애플리케이션](https://docs.spring.io/spring-boot/reference/web/servlet.html)
- **프로젝트 구조**에서 `src/main/resources/static`은 CSS·JS·이미지 등 정적 파일, `src/main/resources/templates`는 Thymeleaf·Mustache 등의 템플릿, `src/main/webapp/WEB-INF/views`는 아래 예제의 JSP 위치다. Tomcat에서 이 JSP 예제를 실행하려면 Jasper(`tomcat-embed-jasper`)와 JSTL의 API·구현체를 추가한다. Spring Boot에서 JSP를 사용할 때는 서블릿 컨테이너와 패키징 방식도 확인해야 한다. [Spring Boot 공식 문서 — JSP 제약](https://docs.spring.io/spring-boot/reference/web/servlet.html#web.servlet.embedded-container.jsp-limitations)

이 JSP 예제는 `InternalResourceViewResolver`에 접두사와 접미사를 지정한다. 빈으로 등록하거나 아래와 같이 설정하며, 논리 뷰 이름 `index`는 `/WEB-INF/views/index.jsp`로 해석된다.

```properties
spring.mvc.view.prefix=/WEB-INF/views/
spring.mvc.view.suffix=.jsp
```

### `SimpleController`의 요청과 응답

`@Controller`는 컴포넌트 스캔으로 등록할 수 있는 MVC 컨트롤러를 표시한다. 클래스의 `@RequestMapping("/simple")`과 메서드의 `@GetMapping("/echo")`를 결합하면 `GET /simple/echo`에 매핑된다. `@RequestMapping`의 `path`와 `value`는 경로를 지정하는 별칭이며, `@GetMapping`과 `@PostMapping`은 각각 GET과 POST를 지정하는 축약형이다.

```java
// @Controller, @RequestMapping("/simple") 클래스 안의 메서드
@GetMapping("/echo")
public String echo(@RequestParam("msg") String msg, Model model) {
    model.addAttribute("msg", service.echo(msg));
    return "index";
}
```

`/simple/echo?msg=Hello`를 요청하면 Controller가 `msg`를 읽고, `SimpleService.echo("Hello")`가 `echo: Hello`를 만든다. Controller가 그 값을 `Model`에 넣고, JSP는 같은 요청에서 `${requestScope.msg}`로 읽는다.

| 반환 방식 | 동작 | 예시 |
| --- | --- | --- |
| 논리 뷰 이름 | JSP 설정에서는 서버 내부에서 View로 forward한다. 같은 요청에서 모델 속성을 읽으며 브라우저 주소는 그대로다. | `return "index"` |
| `redirect:` | 브라우저가 3xx 응답의 `Location`을 보고 대상 URL로 새 요청을 보낸다. | `return "redirect:/target"` |
| `@ResponseBody` | 반환값을 메시지 컨버터로 응답 본문에 기록한다. JSON 응답이라면 Jackson 등의 변환기가 사용될 수 있다. | `Map.of("name", "hong gil dong", "age", 10)` |

## 테스트, 요청 바인딩, 예외 처리와 파일 업로드

### `@WebMvcTest`와 `MockMvc`

`@WebMvcTest(SimpleController.class)`는 지정한 컨트롤러를 중심으로 웹 계층을 구성하는 슬라이스 테스트다. `@MockitoBean`으로 서비스 빈을 테스트용 Mock으로 대체하고, `when(...).thenReturn(...)`으로 응답을 정한다. `MockMvc`는 실제 HTTP 서버를 띄우지 않고 가상 요청·응답으로 매핑과 바인딩 등을 검증한다. 전체 애플리케이션 컨텍스트와 함께 확인하려면 `@SpringBootTest`와 `@AutoConfigureMockMvc` 조합을 사용할 수 있다. [Spring 공식 문서 — MockMvc](https://docs.spring.io/spring-framework/reference/testing/mockmvc.html)

```java
// @WebMvcTest(SimpleController.class), @Autowired MockMvc mock,
// @MockitoBean SimpleService service가 있는 테스트 클래스의 테스트 본문
when(service.echo("Hello")).thenReturn("echo: Hello");

mock.perform(get("/simple/echo").param("msg", "Hello"))
    .andExpect(status().isOk())
    .andExpect(view().name("index"))
    .andExpect(model().attribute("msg", "echo: Hello"));
```

**요청 만들기 → `perform()`으로 실행 → `andExpect()`로 검증** 순서다. `get()`, `post()`, `put()`, `delete()`, `multipart()`로 요청을 만들고 파라미터·헤더·쿠키·세션 속성·파일을 설정할 수 있다. 검증할 값은 상태 코드, 실제 핸들러, 모델 속성, 뷰 이름, forward·redirect URL 등이다. JSON 응답을 테스트할 때는 `contentTypeCompatibleWith(MediaType.APPLICATION_JSON)`과 `jsonPath("$.age").value(10)`처럼 응답 형식과 특정 값을 확인할 수 있다. `$.hobby[2]`는 배열의 세 번째 요소다.

### 파라미터 바인딩과 리다이렉트

Spring은 핸들러 메서드를 호출하기 전에 `HandlerMethodArgumentResolver` 등을 통해 선언된 인자를 마련한다. 요청 데이터 외에 `HttpServletRequest`, `HttpServletResponse`, `HttpSession`, `Locale`, `Model`, `RedirectAttributes` 등 필요한 타입을 인자로 선언할 수 있다.

| 입력 | 사용 방법 | 예시 |
| --- | --- | --- |
| 경로 변수 | `@PathVariable` | `/products/42`에서 `42` 읽기 |
| 쿼리·폼 파라미터 | `@RequestParam` | `?num1=2&num2=3`에서 두 값을 `Integer`로 변환. 필수 여부나 기본값을 지정할 수 있고, 반복 값은 배열이나 `List`로 받을 수 있다. |
| 여러 폼 필드의 묶음 | `@ModelAttribute` | `email`, `name`을 가입 DTO의 생성자 인자나 프로퍼티에 바인딩한다. 만들어진 속성은 `Model`에도 들어가므로 폼을 다시 보여줄 때 사용할 수 있다. |
| 쿠키 | `@CookieValue` | `@CookieValue("age") int age`로 이름이 `age`인 요청 쿠키의 값을 읽고 숫자로 변환한다. |
| JSON 본문 | `@RequestBody` | 메시지 컨버터로 JSON을 요청 DTO로 역직렬화한다. |

`@ModelAttribute`의 기본 이름은 보통 타입 이름에서 유도한다(`Member` → `member`). 기본 생성자와 setter를 쓰는 DTO나 생성자 바인딩이 가능한 record를 사용할 수 있다. [Spring 공식 문서 — `@ModelAttribute` 바인딩](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/modelattrib-method-args.html)

리다이렉트 후에는 새 요청이 시작된다. 예를 들어 **POST → Redirect → GET(PRG)** 흐름에서 등록 직후 새로고침하면 브라우저가 결과 페이지의 GET을 다시 실행한다.

| 전달 방식 | 리다이렉트 뒤의 동작 |
| --- | --- |
| 현재 요청의 모델·요청 속성 | 요청 범위에 그대로 보존되지 않는다. 별도 `RedirectAttributes`가 없으면 설정에 따라 기본 모델의 일부 값이 리다이렉트 URL에 사용될 수 있다. |
| `addAttribute("page", 2)` | 리다이렉트 URL의 경로 변수나 쿼리 파라미터로 전달한다. 예를 들어 `/products?page=2`를 만들 수 있다. |
| `addFlashAttribute("message", "등록 완료")` | 보통 세션에 임시 저장하고 대상 요청의 `Model`에 넘긴 뒤 제거한다. 같은 페이지를 새로고침하면 일회성 메시지는 사라진다. |
| `session.setAttribute(...)` | 세션이 유지되는 동안 여러 요청에서 읽을 수 있다. 일회성 값은 사용 후 직접 정리해야 한다. |

[Spring 공식 문서 — Redirect Attributes](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/redirecting-passing-data.html) · [Flash Attributes](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/flash-attributes.html)

### 예외 처리

- **레거시 구성**에서는 `web.xml`의 `<error-page>`로 `404`·`500` 등을 개별 JSP에 연결할 수 있다. **Spring Boot**는 기본 오류 경로 `/error`를 처리하는 `BasicErrorController`를 제공한다. HTML 요청에는 상태별 오류 화면이나 공통 화면 등을 사용하며, 구성에 따라 기본 Whitelabel 화면이 표시될 수 있다. JSON 응답에서는 오류 정보를 본문에 담는다.
- **공통 예외 처리**는 `@ControllerAdvice`와 `@ExceptionHandler`를 조합한다. 예를 들어 여러 컨트롤러에서 발생하는 업무 예외를 한곳에서 받아 로그를 남기고, `ModelAndView`로 오류 화면과 모델을 지정하거나 `ResponseEntity`로 상태 코드와 응답 본문을 지정한다. 적용 대상은 패키지나 애너테이션 등으로 제한할 수 있다.
- **상태 코드 사례**에서는 등록된 메서드에서 처리되지 않은 예외가 발생하면 `500`, 존재하지 않는 경로는 `404`, POST만 등록된 경로에 GET으로 요청하면 `405`가 될 수 있다. 업무 예외를 MVC에서 처리하면 그 응답이 사용되고, 해결되지 않은 오류는 Boot의 오류 처리로 이어질 수 있다. [Spring Boot 공식 문서 — 오류 처리](https://docs.spring.io/spring-boot/reference/web/servlet.html#web.servlet.spring-mvc.error-handling)

### 파일 업로드와 화면 표시

1. **View**는 `method="post"`, `enctype="multipart/form-data"`인 폼에 `file`과 `desc` 입력을 둔다. Ajax 버전에서는 JavaScript가 `FormData`에 같은 이름으로 파일과 설명을 추가해 `fetch()`의 본문으로 보낸다. 브라우저가 멀티파트의 경계값을 포함한 `Content-Type`을 구성한다.
2. **Controller**는 `@PostMapping("/fileupload")`에서 `@RequestParam("file") MultipartFile file`과 `@RequestParam(value = "desc", required = false) String desc`를 받는다. 서비스에 처리를 맡기고 화면용 모델 속성이나 JSON 응답을 준비한다. [Spring 공식 문서 — 멀티파트 폼](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/multipart-forms.html)
3. **서비스와 저장 계층**은 파일을 확인한 뒤 `transferTo()` 등의 방식으로 저장하고, 화면에 필요한 파일명·설명 등을 반환한다. 서버 설정에는 `spring.servlet.multipart`의 `location`, `max-file-size`(파일 하나), `max-request-size`(전체 요청), `file-size-threshold`(디스크 기록 기준)이 있다. 저장 위치를 지정하고, 예를 들어 파일당 `10MB`, 요청당 `50MB`, 임계값을 `1MB`로 설정할 수 있다.
4. **조회와 다운로드**는 브라우저 URL과 물리적 저장 위치를 연결한다. `WebMvcConfigurer#addResourceHandlers()`로 `/upload/**`를 실제 디렉터리에 매핑하고, `<img src="...">` 또는 `<a download>`로 이미지를 표시하거나 내려받을 수 있다.
5. **Base64 표시**는 파일 바이트를 ASCII 문자열로 바꿔 `data:image/png;base64,...` 형식으로 응답에 담는 방법이다. Ajax로 받은 값을 `img.src`에 할당하면 이미지에 대한 별도 HTTP 요청이 줄어든다. 인코딩된 데이터는 원본보다 약 3분의 1 커지고, 별도 이미지 URL을 사용하는 경우와 같은 독립적인 HTTP 캐시를 활용하기 어렵다.

## 혼동하기 쉬운 책임 경계

| 상황 | 책임을 나누는 기준 |
| --- | --- |
| **입력 검증은 어디에 두나?** | 숫자 변환과 필수 필드 같은 요청 형식은 웹 입력 경계에서 검사한다. 판매 가능 여부나 현재 재고처럼 업무 상태에 근거한 규칙은 Model 쪽에서 판단한다. |
| **Controller와 Service의 경계는?** | Controller는 요청과 응답을 연결한다. Service는 상품 조회·주문 생성 등 한 작업에 필요한 업무 처리를 조율한다. 예를 들어 서비스는 공개 가능한 상품을 조회하고, 웹 쪽에서 결과가 비어 있는 경우를 `404`로 해석할 수 있다. |
| **Entity와 DTO는 각각 무슨 역할인가?** | Entity는 상품처럼 식별자와 수명 주기가 있는 대상을 표현할 수 있다. DTO는 필요한 값의 묶음을 전달한다. `ProductDetail`에 이름·가격·주문 가능 여부만 담으면 템플릿은 상품 Entity 전체의 필드 구조에 의존할 필요가 줄어든다. |
| **버튼이 비활성화되면 주문이 막히나?** | 버튼의 상태는 화면 표현이다. 주문 요청을 받으면 서버의 업무 규칙이 당시의 판매 상태와 재고를 확인해야 한다. |

## 장점과 단점

| 장점 | 단점 및 비용 |
| --- | --- |
| **변경 범위가 분명해진다.** 화면 배치 변경과 재고 정책 변경을 서로 다른 곳에서 처리할 수 있다. | **작은 기능에도 구조가 늘어난다.** 짧은 기능에 클래스와 데이터 변환 단계를 과도하게 두면 전체 흐름을 따라가는 비용이 커진다. |
| **업무 규칙을 재사용할 수 있다.** 상세 페이지와 JSON API가 같은 공개 정책을 호출할 수 있다. | **경계 설정에 판단이 필요하다.** 예를 들어 표시용 가격과 할인 정책을 구분하지 않으면 계산이 여러 화면에 흩어지거나 Controller가 비대해질 수 있다. |
| **역할별로 테스트하기 쉽다.** 업무 규칙은 단위 테스트로, 매핑과 응답 상태는 `MockMvc`로, HTML 표현은 렌더링 결과로 검증할 수 있다. | **통합 흐름도 확인해야 한다.** 모델 속성 이름과 템플릿이 참조하는 이름이 어긋나는 오류는 각 역할을 따로 테스트하는 것만으로 발견하기 어렵다. |

## 핵심 요약

- **Model**은 상품의 상태와 주문 규칙을 관리한다. 주문 요청이 들어오면 해당 시점의 상태를 기준으로 주문 가능 여부를 판단한다.
- **View**는 주어진 결과를 화면으로 표현한다. 가격 형식, 안내 문구, 버튼 표시를 맡는다.
- **Controller**는 입력을 받아 작업을 호출하고, 결과를 화면이나 HTTP 응답으로 연결한다.
- Spring MVC에서 **HTML 응답**은 `Model` 속성과 `View`를 통해 렌더링한다. **JSON 응답**은 일반적으로 `@ResponseBody`와 `HttpMessageConverter`를 통해 본문에 기록한다.
- **리다이렉트는 새 요청**이다. URL에 넣을 값은 `addAttribute()`, 한 번만 보여줄 메시지는 `addFlashAttribute()`로 전달할 수 있다.
- **`MockMvc`**로 URL 매핑, 응답 상태, 모델 속성, 뷰 이름, JSON 본문을 검증할 수 있다. **`@ControllerAdvice`**는 여러 컨트롤러의 공통 예외 응답을 처리한다.

## 기술면접 질문과 모범 답변

### 질문 1. MVC에서 각 역할의 책임을 설명해 주세요. 할인 금액 계산과 가격 표시 형식은 각각 어디에 두겠습니까?

**모범 답변**

Model은 상품과 주문의 상태 및 업무 규칙을 관리하고, View는 결과를 사용자에게 보여줍니다. Controller는 요청을 받아 필요한 작업을 호출하고 응답을 선택합니다. 회원 등급이나 쿠폰 조건에 따라 실결제 가격을 계산하는 로직은 Model 쪽의 업무 규칙입니다. 상세 화면과 주문 처리에서 같은 기준을 쓸 수 있어야 하기 때문입니다. 계산 결과를 `25,000원`처럼 표시하는 처리는 View나 화면용 포맷터에 둡니다.

### 질문 2. Spring MVC에서 `GET /products/42` 요청이 HTML로 응답되기까지 어떤 일이 일어나나요?

**모범 답변**

`DispatcherServlet`이 요청을 받고 `HandlerMapping`을 통해 해당 Controller 메서드를 찾습니다. `HandlerAdapter`가 경로 변수 `42`를 메서드 인자에 바인딩하고 메서드를 호출합니다. Controller는 서비스에 상품 조회를 맡긴 뒤 결과를 `Model`에 넣고 `products/detail` 같은 논리 뷰 이름을 반환합니다. `DispatcherServlet`은 `ViewResolver`로 실제 `View`를 찾고, `View`가 모델 속성을 사용해 최종 HTML을 렌더링합니다.

### 질문 3. 뷰 이름 반환, `redirect:`, `@ResponseBody`는 각각 어떻게 처리되나요? 등록 완료 메시지는 어떻게 전달하나요?

**모범 답변**

화면용 `@Controller`가 논리 뷰 이름을 반환하면 프레임워크가 뷰를 찾고 현재 요청의 모델 속성으로 HTML을 렌더링합니다. `redirect:`는 브라우저에 이동 응답을 보내므로 대상 URL로 새 요청이 발생합니다. 등록 완료 메시지처럼 한 번만 필요한 값은 `RedirectAttributes.addFlashAttribute()`로 전달합니다. `@ResponseBody`는 반환값을 메시지 컨버터로 응답 본문에 기록합니다. `@RestController`에도 이 동작이 포함되며, JSON이 선택되고 적절한 변환기가 있으면 DTO가 JSON으로 직렬화됩니다.
