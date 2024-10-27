# 3장 View Engine

## **3.1 EJS 소개**

- **서버 사이드 렌더링 (SSR)**: SSR은 클라이언트의 요청에 따라 서버에서 HTML을 동적으로 생성하고 전송하는 방식입니다. EJS나 Pug와 같은 템플릿 엔진을 사용하여 Thymeleaf 같은 Java 기반 템플릿 엔진의 기능을 대체할 수 있습니다.
- **EJS(Embedded JavaScript Templates)**: Express.js에서 널리 사용되는 템플릿 엔진으로, HTML 내에 JavaScript를 직접 삽입하여 동적인 웹 페이지를 생성할 수 있습니다. 이는 서버에서 페이지의 로직을 처리하고 완성된 형태의 HTML을 클라이언트에게 제공함으로써 초기 로딩 시간을 단축시키고 검색 엔진 최적화(SEO)를 향상시킬 수 있습니다.

## **3.2 EJS 템플릿 엔진 설치 및 설정**

1. **EJS 설치**:
    
    ```bash
    npm install ejs --save
    ```
    
2. **Express.js에서 EJS 사용 설정**
    - app.js 뷰엔진 설정 및 “/” 뷰엔진을 렌더링 하는 방식으로 변경 합니다.
    
    ```jsx
    app.set('view engine', 'ejs');  // EJS를 템플릿 엔진으로 설정
    app.set('views', './views');    // 뷰 파일들이 위치한 폴더 설정
    
    app.get('/', (req, res) => {
      res.render('index', { message: 'Hello EJS!' });
    });
    ```
    
3. **템플릿 파일 (`views/index.ejs`)**:
    - 프로젝트에 views 디렉토리를 만들고 index.ejs 파일을 생성 후 다음
    
    ```html
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Express with EJS</title>
    </head>
    <body>
      <h1><%= message %></h1>  <!-- 서버에서 전달한 message 변수를 화면에 출력 -->
    </body>
    </html>
    
    ```
    

## **3.3 데이터 바인딩 및 반복문 처리**

텍스트 출력은 EJS에서는 `<%= %>` 구문으로 처리합니다.

### **데이터 출력**

1. **Express 라우트에서 데이터 전달**
    - 뷰엔진에서 필요한 임시 데이터 준비.
    
    ```jsx
    app.get('/items', (req, res) => {
      const items = [
        { name: 'Item 1', price: 100 },
        { name: 'Item 2', price: 200 },
        { name: 'Item 3', price: 300 }
      ];
      res.render('items', { items });
    });
    ```
    
2. **템플릿에서 데이터 출력** (`views/items.ejs`)
    - 새 뷰엔진 페이지에서 전달된 임시 데이터 출력.
    
    ```html
    <h1>상품 목록</h1>
    <ul>
      <% items.forEach(item => { %>
        <li><%= item.name %> - <%= item.price %>원</li>
      <% }) %>
    </ul>
    ```
    

## **3.4 조건문 및 반복문 처리**

 EJS의 JavaScript 문법으로 쉽게 변환할 수 있습니다.

### **조건문 처리**

1. **Express 라우트에서 조건 데이터 전달**:
    
    ```jsx
    app.get('/items', (req, res) => {
      const items = [
        { name: 'Item 1', price: 100 },
        { name: 'Item 2', price: 200 },
        { name: 'Item 3', price: 300 }
      ];
      res.render('items', { items });
    });
    ```
    
2. **템플릿에서 조건문 처리** (`views/items.ejs`):
    
    ```html
    <ul>
      <% items.forEach(item => { %>
        <% if (item.price > 150) { %>
          <li><%= item.name %> - <%= item.price %>원 - 고가 상품</li>
        <% } else { %>
          <li><%= item.name %> - <%= item.price %>원 - 저가 상품</li>
        <% } %>
      <% }) %>
    </ul>
    
    ```
    

---

## **3.5 레이아웃 및 공통 템플릿 처리**

Thymeleaf에서 페이지 레이아웃 기능을 구현한 것처럼, EJS에서도 **`<%- include('파일명') %>`** 구문을 통해 공통 헤더와 푸터를 처리할 수 있습니다.

1. **header.ejs**:
    
    ```html
    <header>
      <h1>쇼핑몰 프로젝트</h1>
    </header>
    ```
    
2. **footer.ejs**:
    
    ```html
    <footer>
      <p>Copyright © 2024 쇼핑몰 프로젝트</p>
    </footer>
    
    ```
    
3. **main.ejs**:
    
    ```html
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>쇼핑몰</title>
    </head>
    <body>
      <%- include('header') %>
    
      <main>
        <%= content %>
      </main>
    
      <%- include('footer') %>
    </body>
    </html>
    
    ```
    

## **3.6 페이지 캐싱 및 성능 최적화**

Express.js에서는 **Cache-Control**을 사용해 캐싱을 제어할 수 있습니다.

```jsx
app.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=300');
  next();
});

```