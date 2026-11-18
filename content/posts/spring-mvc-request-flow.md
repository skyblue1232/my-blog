---
title: "Spring MVC 상세 정리 — Model·View·Controller에서 HTTP 응답까지"
description: "상품 상세 요청으로 MVC의 책임을 나누고, DispatcherServlet, JSP 렌더링, 요청 바인딩, 리다이렉트, MockMvc, 예외 처리와 파일 업로드를 살펴봅니다."
date: 2026-11-18
tags: ["Java", "Spring MVC", "Spring Boot", "JSP", "Backend"]
category: backend
---

## MVC에서 코드를 어디에 둘까

쇼핑몰에서 운동화를 클릭하면 이름과 가격이 나온다. 이때 프로그램은 상품 정보를 찾아야 하고, 품절 여부도 확인해야 하며, 그 결과를 화면으로 보여줘야 한다. **MVC(Model–View–Controller)**는 이 일을 세 역할로 나누는 설계 방식이다. 상품과 주문 규칙은 Model, 가격과 버튼을 보여주는 일은 View, 클릭으로 들어온 요청을 상품 조회로 연결하는 일은 Controller가 맡는다.

크롬 같은 **브라우저**는 화면을 보여주는 프로그램이다. 쇼핑몰의 **서버**는 상품 정보를 조회하거나 주문을 받는 쪽이다. 브라우저가 서버에 보내는 메시지를 **요청**, 서버가 돌려주는 메시지를 **응답**이라고 한다. 웹에서는 두 메시지를 주고받는 약속을 **HTTP**라고 부른다. 화면을 그릴 때 브라우저가 읽는 문서 형식이 **HTML**이다.

웹 주소를 **URL**이라고 한다. 예를 들어 `https://shop.example/products/42`에서 `/products/42`는 주소의 **경로**, `42`는 상품을 구별하는 번호인 **ID**다. `GET`은 정보를 읽어 달라는 요청 방식이고, `POST`는 주문이나 가입처럼 처리할 데이터를 보낼 때 자주 쓰는 방식이다. 서버는 결과를 숫자로도 알려준다. `200`은 정상 처리, `404`는 요청한 대상을 찾지 못했다는 뜻이다.

| 역할 | 핵심 질문 | 상품 상세 및 주문 예시 |
| --- | --- | --- |
| **Model** | 어떤 상태를 관리하고 어떤 업무 규칙을 적용하는가? | 판매 상품을 조회하고, 주문 가능 여부를 판단한다. |
| **View** | 결과를 사용자에게 어떻게 보여주는가? | 상품 이름과 가격을 표시하고, 주문 가능 여부에 따라 버튼 상태를 바꾼다. |
| **Controller** | 이 입력에 어떤 작업을 실행하고 어떤 응답으로 돌려주는가? | URL에서 상품 ID를 받아 조회를 요청하고, 상세 화면이나 `404`로 연결한다. |

## Model(모델) — 업무 상태와 규칙

Model은 애플리케이션이 다루는 **데이터, 상태, 그리고 그 상태에 적용되는 업무 규칙**을 표현한다. 쇼핑몰이라면 상품 가격과 재고가 상태이고, “판매 중인 상품만 주문할 수 있다”, “주문 수량은 재고를 초과할 수 없다”가 업무 규칙이다.

Spring 프로젝트에서는 상품 조회처럼 한 작업을 맡는 코드를 **서비스(Service)**, 상품·주문처럼 프로그램이 다루는 대상을 표현한 코드를 **도메인 객체**라고 부른다. **리포지토리(Repository)**는 저장된 정보를 찾거나 갱신하는 코드다. 아래 예제의 **DB(데이터베이스)**는 상품이나 주문 기록을 저장해 두는 곳이다.

- **업무 정보를 표현한다.** `Product`는 상품의 이름, 가격, 판매 상태, 재고를 표현할 수 있다. `Order`는 주문 상품과 수량, 주문 상태를 가지고 결제나 취소에 따른 상태 변경을 표현할 수 있다.
- **업무 규칙을 적용한다.** 상품이 판매 중이고 재고가 있으면 상세 화면의 주문 버튼을 활성화할 수 있다. 실제 주문을 생성할 때는 요청 수량과 그 시점의 판매 상태·재고를 다시 확인한다. 상세 화면을 본 뒤 재고가 바뀔 수 있기 때문이다.
- **필요한 데이터를 조회하고 상태를 갱신한다.** 계층형 Spring 애플리케이션에서는 보통 서비스가 상품 조회나 주문 생성 같은 작업을 수행하고, 도메인 객체가 업무 규칙을 표현하며, 리포지토리가 DB 조회·저장을 맡는다. 예를 들어 `ProductService`가 `ProductRepository`에서 상품을 가져오고, 상품의 공개 정책을 적용해 조회 결과를 만든다.

데이터베이스는 데이터를 저장하는 수단이다. 상품을 메모리에서 조회하더라도 상품의 상태와 주문 규칙을 다루는 Model은 존재한다. MVC에서 Model이 가리키는 범위는 프로젝트에 따라 달라질 수 있다. 위 예제처럼 도메인·서비스·리포지토리를 나눌 수 있으며, MVC 자체는 특정 클래스 구조를 요구하지 않는다.

## View(뷰) — 사용자에게 보이는 표현

View는 **주어진 데이터를 화면에 어떻게 보여줄지** 결정한다. 서버에서 화면을 만들 때는 제목과 가격이 들어갈 자리를 미리 만든 **템플릿(화면 틀)**을 사용할 수 있다. 여러 상품에 같은 틀을 쓰고, 상품마다 이름·가격·안내 문구를 다르게 채운다.

- **Thymeleaf(타임리프)**는 HTML 파일에 적힌 표시 규칙을 읽어 상품 이름이나 가격 같은 값을 채우는 도구다. 예를 들어 제목 자리에 `운동화`를 넣거나 품절일 때만 안내 문구를 남긴다.
- **JSP(JavaServer Pages)**는 서버에서 HTML을 만드는 또 다른 기술이다. `.jsp` 파일에 화면의 틀과 값을 표시하는 구문을 적고, 서버가 실행해 완성된 HTML을 보낸다.
- **렌더링**은 여기서 데이터를 화면 틀에 적용해 HTML을 만드는 과정을 뜻한다. 서버가 HTML을 완성한 뒤에는 브라우저가 그 문서를 읽어 실제 화면을 표시한다. [Spring 공식 가이드 — Thymeleaf로 웹 화면 만들기](https://spring.io/guides/gs/serving-web-content/)

- **데이터에 표시 형식을 적용한다.** 가격 `25000`을 `25,000원`으로 표시하고, 상품이 여러 개라면 동일한 형태의 카드로 나열한다.
- **상태에 맞는 화면을 보여준다.** 버튼이나 입력칸처럼 사람이 화면에서 보고 조작하는 요소를 **UI(사용자 인터페이스)**라고 한다. `orderable`은 주문 가능 여부를 뜻한다. 그 값이 `false`(거짓)이면 View는 버튼을 누를 수 없게 바꾸고 `주문 불가`를 표시할 수 있다. 판매·재고 규칙은 Model 쪽에서 관리한다.
- **사용자 입력을 위한 화면을 구성한다.** 상품 수량 입력칸과 주문 버튼을 배치하고, 검증 오류가 전달되면 해당 입력칸 근처에 메시지를 표시한다. 실제 주문 요청은 서버에서도 검증한다. 사용자는 화면을 거치지 않고 HTTP 요청을 보낼 수 있기 때문이다.

표현 자체에 필요한 조건문과 반복문은 View에 자연스럽게 들어간다. 반면 상품 공개 여부나 할인 조건을 템플릿마다 계산하면 화면마다 판단이 달라질 수 있으므로, 계산 결과를 전달받아 표현하는 편이 일관성을 유지하기 쉽다.

## Controller(컨트롤러) — 입력과 응답을 연결

Controller는 **사용자 입력을 해석하고, 필요한 작업을 호출한 뒤, 결과를 응답으로 연결**한다. `GET`과 `POST` 같은 요청 방식을 **HTTP 메서드**라고 한다. `/products/42`에서 `42`처럼 경로에서 꺼내는 값은 **경로 변수**, `/products?page=2`에서 `page=2`처럼 물음표 뒤에 붙는 값은 **쿼리 파라미터**다. 주문 양식이나 이미지처럼 요청 메시지에 실어 보내는 내용은 **요청 본문**이라고 한다.

코드에서 `detail(...)`처럼 특정 일을 하는 코드 묶음을 **메서드**라고 한다. 메서드가 받을 값을 **인자**라고 부른다. `@GetMapping`처럼 `@`로 시작하는 표시는 **애너테이션**이다. Spring에 “이 코드는 이 경로의 GET 요청을 처리한다” 같은 정보를 알려준다. 요청을 알맞은 코드에 연결하는 것이 **매핑**, 받은 값을 그 코드의 입력에 넣는 것이 **바인딩**이다.

- **요청 값을 처리한다.** `GET /products/42`의 `42`를 상품 ID로 받아 서비스에 전달한다. Spring MVC에서는 `@GetMapping`이 요청 경로와 메서드를 선언하고 `@PathVariable`이 경로 값을 메서드 인자로 바인딩한다.
- **요청에 맞는 작업을 호출한다.** 상세 요청은 상품 조회로, 주문 요청은 주문 생성으로 연결한다. 업무 처리를 서비스에 맡기면 웹 화면과 모바일 앱에도 같은 상품 공개 기준을 적용할 수 있다.
- **처리 결과를 HTTP 응답으로 연결한다.** 조회에 성공하면 상품 정보를 모델 속성에 담고 상세 뷰를 선택한다. 사용자에게 보여줄 수 있는 상품을 찾지 못했다면 예제에서는 `404 Not Found`로 처리한다. 공통 오류 매핑은 별도 예외 처리기에도 둘 수 있다.

Controller가 판단할 사항에는 입력을 읽는 방식과 응답 선택이 포함된다. 예를 들어 `"abc"`를 정수형 상품 ID로 바인딩할 수 없는 문제는 웹 입력 경계에서 처리한다. “회원 등급에 따라 이 상품을 주문할 수 있는가?”처럼 같은 주문 경로라면 어디서든 적용해야 하는 조건은 업무 규칙으로 관리한다.

## 웹 요청의 흐름 — `GET /products/42`

```text
브라우저 ── GET /products/42 ──→ 서버의 공통 입구
서버의 공통 입구 ── 요청 전달 ──→ Controller
Controller ←── 상품 조회 결과 ── ProductService
Controller ── 화면에 쓸 데이터와 화면 이름 ──→ 서버의 공통 입구
서버의 공통 입구 ── 화면 틀 선택과 HTML 완성 ──→ 브라우저
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

이 예시에서는 서버가 HTML을 완성한다. PC에서 실행하는 앱의 화면인 **데스크톱 GUI**에서도 MVC를 적용할 수 있다. 예를 들어 Controller가 클릭을 처리하고 View가 Model의 변경 알림을 받아 화면을 갱신할 수 있다.

## Spring MVC 적용 사례

**Java**는 아래 예제에 사용하는 프로그래밍 언어다. **Spring Framework**는 Java로 서버 프로그램을 만들 때 공통 기능을 제공한다. 그중 웹 요청을 받아 컨트롤러와 응답으로 연결하는 부분이 **Spring MVC**다. **Spring Boot**는 필요한 라이브러리와 설정을 보고 Spring 앱의 기본 구성을 자동으로 준비한다. 웹 앱을 실행할 때는 앱에 포함된 웹 서버인 **내장 톰캣(Tomcat)**을 사용할 수 있다.

### `DispatcherServlet`이 요청을 처리하는 방식

`DispatcherServlet`(디스패처 서블릿)은 Spring MVC의 **프런트 컨트롤러**, 즉 웹 요청을 먼저 받아 다음 처리를 연결하는 공통 입구다. **서블릿**은 Java 웹 서버 환경에서 HTTP 요청과 응답을 다루는 프로그램 구성 요소다. 아래 예시에서 `DispatcherServlet`은 여러 종류의 요청을 받아 알맞은 코드로 보내고, `ProductPageController`는 상품 상세 요청을 맡는다. [Spring 공식 문서 — 요청 처리 과정](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet/sequence.html)

| 순서 | 구성 요소 | `GET /products/42`에서 하는 일 |
| --- | --- | --- |
| 1. 담당 코드 찾기 | `HandlerMapping` | 요청 방식과 주소를 보고 실행할 코드를 찾는다. 요청을 실제로 처리하는 코드를 **핸들러**라고 한다. 여기서는 상품 상세 메서드다. |
| 2. 실행하기 | `HandlerAdapter` | 주소의 `42`를 숫자 입력값으로 준비하고, 찾은 상품 상세 메서드를 실행한다. |
| 3. 데이터와 화면 이름 넘기기 | Controller | 서비스에서 조회한 결과를 `product`라는 이름으로 저장하고, `products/detail`을 사용할 화면 이름으로 돌려준다. 실제 파일과 연결하기 전의 이 이름을 **논리 뷰 이름**이라고 한다. |
| 4. 화면 찾기 | `ViewResolver` (뷰 리졸버) | `products/detail`이라는 이름을 받아 어떤 View로 화면을 만들지 찾는다. 아래 Thymeleaf 설정에서는 해당 View가 `templates/products/detail.html`을 사용한다. |
| 5. HTML 완성하기 | View와 Thymeleaf | 선택된 화면 틀에 `product`의 이름과 가격을 채운다. 서버는 완성된 HTML을 브라우저에 돌려준다. |

예를 들어 운동화의 이름과 가격이 이미 조회됐다면, **ViewResolver는 어떤 화면 틀을 쓸지 찾는 단계**, **Thymeleaf는 선택한 틀에 실제 값을 채우는 단계**다. JSP를 쓰는 경우에도 화면을 찾는 역할은 같고, JSP용 설정에 따라 `.jsp` 화면을 선택한다. [Spring 공식 문서 — DispatcherServlet의 구성 요소](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet/special-bean-types.html)

### HTML 상세 페이지 코드

아래 코드의 흐름은 **상품을 찾고 → 화면에 넘길 값에 이름을 붙이고 → 화면 틀의 이름을 돌려주는 것**이다. `ProductDetail`은 이름·가격·주문 가능 여부를 담은 묶음이다. Java의 `record`를 사용하면 이런 데이터 묶음을 간단히 만들 수 있다. `Optional<ProductDetail>`은 조회 결과가 있을 수도, 없을 수도 있다는 뜻이다. 결과가 비어 있으면 `.orElseThrow(...)`가 실행되어 예제에서는 `404`로 응답한다. [Spring 공식 가이드 — Spring MVC와 Thymeleaf](https://spring.io/guides/gs/serving-web-content/)

`import`는 이 파일에서 사용할 외부 코드 이름을 가져오는 선언이다. `class`는 관련 코드와 데이터를 묶고, 클래스와 이름이 같은 **생성자**는 그 묶음을 만들 때 실행된다. 예제에서는 Spring이 상품 조회 서비스를 생성자에 넘겨준다. 프로그램에 필요한 구성 요소를 외부에서 전달하는 방식을 **의존성 주입(DI)**이라고 한다.

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

`model.addAttribute("product", product)`가 이름 붙여 넘긴 값을 Thymeleaf가 `${product...}`로 읽는다. HTML에서 `<h1>`은 큰 제목, `<p>`는 문단을 뜻한다. `th:text`는 그 안의 글자를 바꾸고, `th:if`는 조건이 맞을 때만 해당 줄을 남긴다. `!`는 참과 거짓을 뒤집으므로 `!product.orderable()`는 “주문할 수 없다”는 뜻이다. `#numbers.formatInteger(...)`는 숫자에 천 단위 쉼표를 넣는다. 상품이 운동화이고 가격이 25000원이며 주문이 불가능하다면 완성된 HTML은 아래와 같다.

```html
<h1>운동화</h1>
<p>25,000원</p>
<p>현재 주문할 수 없습니다.</p>
```

### `Model` 파라미터와 JSON 응답

서버는 화면을 보내기도 하고, 다른 프로그램이 읽을 **데이터**를 보내기도 한다. 이런 요청 통로를 **API**라고 부른다. 예를 들어 쇼핑몰 앱이 같은 상품의 이름과 가격을 받아 자기 화면을 만든다면 `{"name":"운동화","price":25000}`처럼 값의 이름과 내용을 적은 **JSON** 형식을 사용할 수 있다. 프로그램끼리 전달할 값만 묶은 것을 **DTO(Data Transfer Object)**라고 한다. Java의 DTO를 JSON 글자로 바꾸는 일을 **직렬화**, JSON 글자를 Java 데이터로 읽어들이는 일을 **역직렬화**라고 한다. Spring의 `HttpMessageConverter`(메시지 변환기)가 이 변환을 맡을 수 있다.

- **MVC의 Model**은 애플리케이션의 업무 상태와 규칙을 다루는 개념이다. **`org.springframework.ui.Model`**은 뷰 렌더링에 사용할 이름 있는 속성을 담는 Spring 인터페이스다. `model.addAttribute("product", product)`는 조회 결과를 템플릿에서 `product`로 읽을 수 있게 만든다. [Spring 공식 문서 — Controller 반환값과 모델 속성](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/return-types.html)
- **`@Controller`에서 뷰 이름 반환** 방식으로 위 페이지를 제공할 수 있다. `@ResponseBody`를 붙인 메서드나 `@RestController`를 사용하면 메서드 반환값이 응답 본문으로 처리된다. 예를 들어 `GET /api/products/42`에서 DTO를 반환하면, JSON 응답이 선택되고 적절한 `HttpMessageConverter`가 구성된 경우 DTO를 JSON으로 직렬화한다. 일반적인 `@ResponseBody` 경로는 뷰 이름 해석이나 HTML 템플릿 렌더링을 거치지 않는다. [Spring 공식 문서 — `@ResponseBody`](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/responsebody.html)

## Spring MVC 초기화, 요청 매핑과 JSP 응답

### Spring AOP와 프록시의 한계

상품 조회와 주문 저장에는 둘 다 “얼마나 걸렸는지 기록하기”가 필요할 수 있다. 이렇게 여러 기능에 공통으로 들어가는 처리를 **횡단 관심사**라고 부르고, 그 처리를 한곳에 모아 필요한 코드에 적용하는 방식을 **AOP(관점 지향 프로그래밍)**라고 한다. 실행 정보를 남기는 것은 **로깅**, 여러 저장 작업을 한 단위로 묶어 함께 성공하거나 취소되게 하는 것은 **트랜잭션**이다.

**빈(Bean)**은 Spring이 만들고 관리하는 객체다. **프록시**는 실제 서비스 호출 앞에서 요청을 받아, 필요하면 로그를 남기거나 트랜잭션을 시작한 뒤 원래 코드를 실행하는 중간 객체다. 아래 표는 이때 쓰이는 용어를 로그 예시로 설명한다.

| 용어 | 의미 | 로그 예시 |
| --- | --- | --- |
| Target | 적용 대상 객체 | 서비스 빈 |
| Join point | Advice가 실행될 수 있는 지점. Spring AOP에서는 메서드 실행 | 서비스 메서드 실행 |
| Pointcut | 적용할 join point를 고르는 조건 | `set*` 형태의 메서드 실행 선택 |
| Advice | 해당 지점에서 실행할 동작 | `@Before`로 메서드 실행 전에 로그 기록 |
| Aspect | 횡단 관심사를 묶은 모듈 | 로깅 pointcut과 advice를 묶은 클래스 |
| Weaving | Aspect를 대상에 적용하는 과정 | Spring AOP에서 호출을 가로채는 프록시 구성 |

Advice는 실행 시점을 정할 수 있다. `@Before`는 실행 전, `@After`는 실행 후, `@AfterReturning`은 정상 종료 후, `@AfterThrowing`은 오류 발생 후에 실행된다. `@Around`는 앞뒤 처리와 원래 코드 실행을 함께 감싼다.

- **비동기 처리(`@Async`)**는 작업을 맡긴 쪽이 그 작업이 끝날 때까지 기다리지 않고 다음 일을 이어갈 수 있게 한다. `@EnableAsync`로 기능을 켜면 Spring의 `TaskExecutor`가 실행을 맡는다. **스레드**는 프로그램 안에서 작업이 실행되는 단위다. `ThreadPoolTaskExecutor`는 여러 작업에 스레드를 재사용하고, `SimpleAsyncTaskExecutor`는 일반적으로 작업마다 새 스레드를 만든다. `SyncTaskExecutor`는 호출한 스레드에서 작업을 실행한다.
- **캐시(`@Cacheable`)**는 이전 결과를 보관했다가 같은 조건으로 요청이 들어오면 다시 사용하는 방식이다. `@EnableCaching`을 켜고 구구단 결과를 캐시하면, 3단을 다시 요청할 때 같은 **캐시 키**(저장한 결과를 찾는 이름)로 이전 결과를 꺼낼 수 있다.

**자기 호출**에 주의한다. 빈 외부에서 프록시를 통해 호출하면 설정된 부가 기능이 적용될 수 있다. 같은 대상 객체의 `methodB()`가 내부에서 `methodA()`를 직접 호출하면 그 내부 호출은 프록시를 거치지 않아 `methodA()`에 대한 Advice가 실행되지 않는다. 해당 기능을 별도 빈으로 옮겨 프록시를 통해 호출하면 프록시가 부가 기능을 적용할 수 있다. [Spring 공식 문서 — 프록시와 자기 호출](https://docs.spring.io/spring-framework/reference/core/aop/proxying.html)

### 프런트 컨트롤러와 초기화

**초기화**는 앱을 실행하기 전에 요청을 받을 코드나 DB 연결 등을 준비하는 과정이다. **WAS(Web Application Server)**는 Java 웹 프로그램을 실행할 수 있는 서버다. **서블릿 컨테이너**는 그 환경에서 서블릿의 등록과 실행을 맡는다. **Spring 컨텍스트**는 Spring이 빈과 설정을 모아 관리하는 공간이다. 아래의 **루트**는 공용 설정을 담는 상위 공간, **자식**은 웹 화면과 요청 처리에 필요한 설정을 따로 담는 하위 공간이다.

- **직접 구현한 Servlet 예제**에서는 공통 입구가 `action`이라는 입력값을 읽고, 값에 따라 다른 코드를 선택하는 `switch`로 요청을 나눈다. 담당 코드는 서비스를 호출하고 `request.setAttribute()`로 이번 요청에 쓸 값을 저장한 뒤 JSP에 넘긴다. **Spring MVC 예제**에서는 주소와 요청 방식을 애너테이션으로 선언하고, `DispatcherServlet`과 관련 구성 요소가 그 선언에 따라 요청을 연결한다.
- **레거시(예전 방식의) 구성 예시**에서는 WAS가 웹 앱의 설정 파일인 `web.xml`을 읽는다. `ContextLoaderListener`가 서비스·리포지토리·`DataSource`(DB 연결을 제공하는 구성 요소) 같은 공용 빈을 루트 컨텍스트에 준비한다. `DispatcherServlet`은 컨트롤러와 MVC 설정을 자식 컨텍스트에 준비한다. 자식 컨텍스트에서도 공용 빈을 사용할 수 있다.
- **Spring Boot 구성 예시**에서는 `main()`에서 시작하고, 자동 설정으로 일반적으로 하나의 애플리케이션 컨텍스트에서 업무 빈과 웹 빈을 관리한다. 내장 서블릿 컨테이너에 `DispatcherServlet`이 등록된다. [Spring Boot 공식 문서 — Servlet 웹 애플리케이션](https://docs.spring.io/spring-boot/reference/web/servlet.html)
- **프로젝트 구조**에서 `src/main/resources/static`은 CSS·JS·이미지 등 정적 파일, `src/main/resources/templates`는 Thymeleaf·Mustache 등의 템플릿, `src/main/webapp/WEB-INF/views`는 아래 예제의 JSP 위치다. Tomcat에서 이 JSP 예제를 실행하려면 Jasper(`tomcat-embed-jasper`)와 JSTL의 API·구현체를 추가한다. Spring Boot에서 JSP를 사용할 때는 서블릿 컨테이너와 패키징 방식도 확인해야 한다. [Spring Boot 공식 문서 — JSP 제약](https://docs.spring.io/spring-boot/reference/web/servlet.html#web.servlet.embedded-container.jsp-limitations)

이 JSP 예제의 `InternalResourceViewResolver`는 JSP 화면을 찾는 ViewResolver의 한 종류다. 화면 이름 앞에는 폴더 경로(**접두사**), 뒤에는 파일 확장자(**접미사**)를 붙인다. 아래 설정에서 `index`를 받으면 `/WEB-INF/views/` + `index` + `.jsp`를 이어 붙여 실제 파일을 찾는다. Jasper는 JSP를 실행 가능하게 만드는 톰캣 구성 요소이고, JSTL은 JSP에서 반복이나 조건 같은 작업에 쓸 수 있는 표준 태그 모음이다.

```properties
spring.mvc.view.prefix=/WEB-INF/views/
spring.mvc.view.suffix=.jsp
```

### `SimpleController`의 요청과 응답

`@Controller`는 Spring에 이 클래스가 웹 요청을 처리한다고 알려주는 표시다. Spring이 이런 표시를 찾아 객체를 등록하는 과정을 **컴포넌트 스캔**이라고 한다. 클래스의 `@RequestMapping("/simple")`은 공통 주소 앞부분을, 메서드의 `@GetMapping("/echo")`는 그 뒤에 붙는 경로를 정한다. 두 경로를 합치면 `GET /simple/echo`다. `@RequestMapping`의 `path`와 `value`는 둘 다 경로를 지정할 수 있고, `@PostMapping`은 POST 요청을 연결하는 표시다.

```java
// @Controller, @RequestMapping("/simple") 클래스 안의 메서드
@GetMapping("/echo")
public String echo(@RequestParam("msg") String msg, Model model) {
    model.addAttribute("msg", service.echo(msg));
    return "index";
}
```

`/simple/echo?msg=Hello`를 요청하면 Controller가 `msg`를 읽고, `SimpleService.echo("Hello")`가 `echo: Hello`를 만든다. Controller가 그 값을 `Model`에 넣고, JSP는 같은 요청에서 `${requestScope.msg}`로 읽는다.

`requestScope`는 **이번 한 건의 요청 동안** 값을 읽을 수 있는 범위다. **forward(포워드)**는 서버가 그 요청을 내부의 JSP로 넘겨 화면을 만드는 방식이다. **redirect(리다이렉트)**는 브라우저에 새 주소를 알려주고 그 주소로 다시 요청하게 하는 방식이다. 서버는 이동 지시를 뜻하는 `3xx` 상태 코드와 새 주소를 담은 `Location` 헤더를 보낸다. **헤더**는 응답에 덧붙이는 안내 정보다.

| 반환 방식 | 동작 | 예시 |
| --- | --- | --- |
| 논리 뷰 이름 | JSP 설정에서는 서버 내부에서 View로 forward한다. 같은 요청에서 모델 속성을 읽으며 브라우저 주소는 그대로다. | `return "index"` |
| `redirect:` | 브라우저가 3xx 응답의 `Location`을 보고 대상 URL로 새 요청을 보낸다. | `return "redirect:/target"` |
| `@ResponseBody` | 반환값을 메시지 컨버터로 응답 본문에 기록한다. JSON 응답이라면 Jackson 등의 변환기가 사용될 수 있다. | `Map.of("name", "hong gil dong", "age", 10)` |

## 테스트, 요청 바인딩, 예외 처리와 파일 업로드

### `@WebMvcTest`와 `MockMvc`

이 테스트에서는 “`Hello`를 보내면 올바른 주소에서 요청을 받고, `echo: Hello`를 담아 `index` 화면을 선택하는가?”를 확인한다. `@WebMvcTest`는 웹 요청 처리에 필요한 부분만 준비한다. 이렇게 앱의 일부에 초점을 맞추는 검증을 **슬라이스 테스트**라고 한다. `@MockitoBean`은 실제 서비스를 정해진 답을 돌려주는 **Mock(테스트용 가짜 객체)**으로 바꿔준다. `MockMvc`는 서버를 따로 띄우지 않아도 요청을 보내는 상황을 흉내 내는 도구다. 앱의 전체 설정과 함께 확인할 때는 `@SpringBootTest`와 `@AutoConfigureMockMvc`를 사용할 수 있다. [Spring 공식 문서 — MockMvc](https://docs.spring.io/spring-framework/reference/testing/mockmvc.html)

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

Spring은 메서드를 실행하기 전에 **인자 해석기**(`HandlerMethodArgumentResolver`) 등을 통해 필요한 입력값을 마련한다. 예를 들어 `num1=2`로 전달된 글자 `"2"`를 덧셈에 사용할 수 있는 숫자 `2`로 바꾼다. 메서드는 필요하면 요청을 읽는 `HttpServletRequest`, 응답을 다루는 `HttpServletResponse`, 언어·지역 설정인 `Locale`도 받을 수 있다.

**쿠키**는 브라우저가 저장했다가 이후 요청에 함께 보내는 작은 값이다. **세션**은 서버가 같은 방문자의 여러 요청에 걸쳐 상태를 기억하는 공간이다. 예를 들어 브라우저가 세션 식별자를 쿠키로 보내면 서버는 그 식별자로 로그인 상태를 찾을 수 있다.

| 입력 | 사용 방법 | 예시 |
| --- | --- | --- |
| 경로 변수 | `@PathVariable` | `/products/42`에서 `42` 읽기 |
| 쿼리·폼 파라미터 | `@RequestParam` | `?num1=2&num2=3`에서 두 값을 `Integer`로 변환. 필수 여부나 기본값을 지정할 수 있고, 반복 값은 배열이나 `List`로 받을 수 있다. |
| 여러 폼 필드의 묶음 | `@ModelAttribute` | `email`, `name`을 가입 DTO의 생성자 인자나 프로퍼티에 바인딩한다. 만들어진 속성은 `Model`에도 들어가므로 폼을 다시 보여줄 때 사용할 수 있다. |
| 쿠키 | `@CookieValue` | `@CookieValue("age") int age`로 이름이 `age`인 요청 쿠키의 값을 읽고 숫자로 변환한다. |
| JSON 본문 | `@RequestBody` | 메시지 컨버터로 JSON을 요청 DTO로 역직렬화한다. |

`@ModelAttribute`의 기본 이름은 보통 타입 이름에서 유도한다(`Member` → `member`). 기본 생성자와 setter를 쓰는 DTO나 생성자 바인딩이 가능한 record를 사용할 수 있다. [Spring 공식 문서 — `@ModelAttribute` 바인딩](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/modelattrib-method-args.html)

리다이렉트 후에는 새 요청이 시작된다. **POST → Redirect → GET(PRG)**은 등록 버튼을 눌러 보낸 POST를 처리한 뒤, 브라우저를 결과 페이지의 GET으로 이동시키는 방식이다. 새로고침하면 마지막 GET을 반복하므로 등록 양식을 다시 보내는 상황을 줄일 수 있다. **Flash 속성**은 `등록 완료`처럼 새 요청에서 한 번만 읽을 값을 잠시 보관하는 방식이다.

| 전달 방식 | 리다이렉트 뒤의 동작 |
| --- | --- |
| 현재 요청의 모델·요청 속성 | 요청 범위에 그대로 보존되지 않는다. 별도 `RedirectAttributes`가 없으면 설정에 따라 기본 모델의 일부 값이 리다이렉트 URL에 사용될 수 있다. |
| `addAttribute("page", 2)` | 리다이렉트 URL의 경로 변수나 쿼리 파라미터로 전달한다. 예를 들어 `/products?page=2`를 만들 수 있다. |
| `addFlashAttribute("message", "등록 완료")` | 보통 세션에 임시 저장하고 대상 요청의 `Model`에 넘긴 뒤 제거한다. 같은 페이지를 새로고침하면 일회성 메시지는 사라진다. |
| `session.setAttribute(...)` | 세션이 유지되는 동안 여러 요청에서 읽을 수 있다. 일회성 값은 사용 후 직접 정리해야 한다. |

[Spring 공식 문서 — Redirect Attributes](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/redirecting-passing-data.html) · [Flash Attributes](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/flash-attributes.html)

### 예외 처리

**예외**는 코드가 예정대로 일을 끝낼 수 없을 때 알려주는 신호다. 예를 들어 마지막 상품이 이미 팔려 주문을 받을 수 없게 되면, 서버는 상황에 맞는 안내와 응답 상태를 보내야 한다. `@ExceptionHandler`는 특정 예외가 생기면 실행할 처리 코드에 붙이고, `@ControllerAdvice`는 여러 컨트롤러가 공통으로 쓸 처리 코드를 모으는 데 쓴다. `ModelAndView`는 오류 화면과 거기에 넘길 데이터를 함께 전달하고, `ResponseEntity`는 상태 코드·안내 정보·본문을 직접 정할 수 있게 해준다.

- **레거시 구성**에서는 `web.xml`의 `<error-page>`로 `404`·`500` 등을 개별 JSP에 연결할 수 있다. **Spring Boot**는 기본 오류 경로 `/error`를 처리하는 `BasicErrorController`를 제공한다. HTML 요청에는 상태별 오류 화면이나 공통 화면 등을 사용하며, 구성에 따라 기본 Whitelabel 화면이 표시될 수 있다. JSON 응답에서는 오류 정보를 본문에 담는다.
- **공통 예외 처리**는 `@ControllerAdvice`와 `@ExceptionHandler`를 조합한다. 예를 들어 여러 컨트롤러에서 발생하는 업무 예외를 한곳에서 받아 로그를 남기고, `ModelAndView`로 오류 화면과 모델을 지정하거나 `ResponseEntity`로 상태 코드와 응답 본문을 지정한다. 적용 대상은 패키지나 애너테이션 등으로 제한할 수 있다.
- **상태 코드 사례**에서는 등록된 메서드에서 처리되지 않은 예외가 발생하면 `500`, 존재하지 않는 경로는 `404`, POST만 등록된 경로에 GET으로 요청하면 `405`가 될 수 있다. 업무 예외를 MVC에서 처리하면 그 응답이 사용되고, 해결되지 않은 오류는 Boot의 오류 처리로 이어질 수 있다. [Spring Boot 공식 문서 — 오류 처리](https://docs.spring.io/spring-boot/reference/web/servlet.html#web.servlet.spring-mvc.error-handling)

### 파일 업로드와 화면 표시

파일을 보내는 양식은 사진과 설명 글처럼 여러 종류의 값을 담을 수 있다. **멀티파트(multipart)**는 값을 한 요청 안에서 여러 부분으로 나눠 보내는 포장 방식이다. 이 형식을 쓴다는 표시가 `multipart/form-data`이고, Spring이 받은 파일을 다룰 때 쓰는 타입이 `MultipartFile`이다. **Ajax**는 페이지 전체를 다시 불러오지 않고 브라우저 코드가 서버와 데이터를 주고받는 방식이다. 브라우저에서 실행되는 코드인 **JavaScript**가 `FormData`에 파일과 설명을 담고 `fetch()`로 보낼 수 있다.

1. **View**는 `method="post"`, `enctype="multipart/form-data"`인 폼에 `file`과 `desc` 입력을 둔다. Ajax 버전에서는 JavaScript가 `FormData`에 같은 이름으로 파일과 설명을 추가해 `fetch()`의 본문으로 보낸다. 브라우저는 데이터 형식을 알려주는 `Content-Type`에 각 부분을 나누는 구분자도 넣는다.
2. **Controller**는 `@PostMapping("/fileupload")`에서 `@RequestParam("file") MultipartFile file`과 `@RequestParam(value = "desc", required = false) String desc`를 받는다. 서비스에 처리를 맡기고 화면용 모델 속성이나 JSON 응답을 준비한다. [Spring 공식 문서 — 멀티파트 폼](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/multipart-forms.html)
3. **서비스와 저장 계층**은 파일을 확인한 뒤 `transferTo()` 등의 방식으로 저장하고, 화면에 필요한 파일명·설명 등을 반환한다. 서버 설정에는 `spring.servlet.multipart`의 `location`, `max-file-size`(파일 하나), `max-request-size`(전체 요청), `file-size-threshold`(디스크 기록 기준)이 있다. 저장 위치를 지정하고, 예를 들어 파일당 `10MB`, 요청당 `50MB`, 임계값을 `1MB`로 설정할 수 있다.
4. **조회와 다운로드**는 브라우저 URL과 물리적 저장 위치를 연결한다. `WebMvcConfigurer#addResourceHandlers()`로 `/upload/**`를 실제 디렉터리에 매핑하고, `<img src="...">` 또는 `<a download>`로 이미지를 표시하거나 내려받을 수 있다.
5. **Base64 표시**는 이미지 파일의 내용을 전송 가능한 글자로 바꾸는 방법이다. 브라우저는 `data:image/png;base64,...` 형식을 읽어 그 자리에서 이미지를 표시할 수 있다. 이 값을 이미지의 출처를 정하는 `img.src`에 넣으면 이미지를 요청하는 일이 한 번 줄지만, 데이터는 원본보다 약 3분의 1 커진다. 이미지 파일에 별도 주소를 주면 브라우저가 전에 내려받은 파일을 따로 보관했다가 재사용하기가 더 쉽다.

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
