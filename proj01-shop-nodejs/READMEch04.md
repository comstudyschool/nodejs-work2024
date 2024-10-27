# 4장 Passport.js를 이용한 회원 가입 및 로그인 구현

**Node.js + Express + Passport.js**로 인증/인가, 회원 가입 및 로그인 기능 구현.

### **4장: Express.js + Passport.js를 이용한 회원 가입 및 로그인 구현**

### **4.1 인증/인가 소개**

- **인증**: 사용자가 시스템에 접근할 수 있는 자격을 가지고 있는지 확인하는 절차입니다. 일반적으로 사용자 로그인 시 수행됩니다.
- **인가**: 인증 후에 사용자가 특정 리소스에 접근할 권한이 있는지 확인하는 절차입니다. 관리 페이지와 같은 특정 영역에 대한 접근 권한을 부여할 때 사용됩니다.

### **4.2 Passport.js로 인증 설정 추가**

**assport.js**를 사용하여 Node.js에서 사용자 인증을 구현할 수 있습니다.

1. **Passport.js 설치**:
    
    ```bash
    npm install passport passport-local express-session
    
    ```
    
2. **Express에서 Passport.js 설정**:
    
    ```jsx
    const express = require('express');
    const passport = require('passport');
    const LocalStrategy = require('passport-local').Strategy;
    const session = require('express-session');
    
    const app = express();
    
    // 세션 설정
    app.use(session({
      secret: 'secret-key',
      resave: false,
      saveUninitialized: false
    }));
    
    // Passport 초기화
    app.use(passport.initialize());
    app.use(passport.session());
    
    // 사용자 인증 전략 정의
    passport.use(new LocalStrategy(
      function(username, password, done) {
        // 여기서 사용자 정보 확인 (예: 데이터베이스에서 확인)
        if (username === 'admin' && password === 'password') {
          return done(null, { username: 'admin' });
        } else {
          return done(null, false, { message: 'Invalid credentials' });
        }
      }
    ));
    
    // 세션 저장 및 로드
    passport.serializeUser((user, done) => {
      done(null, user.username);
    });
    
    passport.deserializeUser((username, done) => {
      // 여기서 사용자 정보 가져오기
      done(null, { username: 'admin' });
    });
    
    ```
    

### **4.3 회원 가입 구현**

회원 가입 기능을 구현하기 위해 사용자가 입력한 데이터를 데이터베이스에 저장해야 합니다.

1. **회원 가입 페이지** (`views/register.ejs`):
    
    ```html
    <form action="/register" method="post">
      <input type="text" name="username" placeholder="Username" required>
      <input type="password" name="password" placeholder="Password" required>
      <button type="submit">Register</button>
    </form>
    
    ```
    
2. **회원 가입 처리 로직**:
    
    ```jsx
    const bodyParser = require('body-parser');
    const users = []; // 간단한 배열로 사용자 저장 (데이터베이스 사용 가능)
    
    app.use(bodyParser.urlencoded({ extended: false }));
    
    app.post('/register', (req, res) => {
      const { username, password } = req.body;
      users.push({ username, password });
      res.redirect('/login');
    });
    
    ```
    

### **4.4 로그인/로그아웃 구현**

1. **로그인 페이지** (`views/login.ejs`):
    
    ```html
    <form action="/login" method="post">
      <input type="text" name="username" placeholder="Username" required>
      <input type="password" name="password" placeholder="Password" required>
      <button type="submit">Login</button>
    </form>
    
    ```
    
2. **로그인 처리 로직**:
    
    ```jsx
    app.post('/login', passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/login'
    }));
    
    ```
    
3. **로그아웃 기능**:
    
    ```jsx
    app.get('/logout', (req, res) => {
      req.logout();
      res.redirect('/login');
    });
    
    ```
    

### **4.5 페이지 권한 설정**

스프링 시큐리티에서 역할 기반 접근 제어(Role-based Access Control)를 설정하는 것처럼, Express.js에서도 미들웨어를 사용하여 페이지별 접근 권한을 설정할 수 있습니다.

1. **관리자 권한이 필요한 페이지에 대한 접근 제어**:
    
    ```jsx
    function ensureAuthenticated(req, res, next) {
      if (req.isAuthenticated()) {
        return next();
      }
      res.redirect('/login');
    }
    
    function ensureAdmin(req, res, next) {
      if (req.isAuthenticated() && req.user.username === 'admin') {
        return next();
      }
      res.status(403).send('Access denied');
    }
    
    // 일반 사용자 접근 가능
    app.get('/profile', ensureAuthenticated, (req, res) => {
      res.send(`Welcome, ${req.user.username}`);
    });
    
    // 관리자만 접근 가능
    app.get('/admin', ensureAdmin, (req, res) => {
      res.send('Welcome to admin page');
    });
    
    ```
    

### **결론**

스프링 부트에서 스프링 시큐리티를 사용해 회원 가입, 로그인/로그아웃, 페이지 권한 설정을 처리했던 부분을 **Express.js**에서는 **Passport.js**를 사용하여 비슷한 방식으로 구현할 수 있습니다. Passport.js는 간단하고 확장성이 뛰어난 인증 라이브러리로, 세션 기반 인증, 역할 기반 접근 제어 등을 구현하는 데 유용합니다.

이를 통해 스프링 시큐리티의 기능을 Node.js + Express로 변환하여 쇼핑몰 프로젝트에 적용할 수 있습니다.