# 4장 Passport.js를 이용한 회원 가입 및 로그인 구현
## **4.1 인증/인가 소개**

- **인증(Authentication)**: 사용자가 시스템에 접근할 수 있는 자격을 가지고 있는지 확인하는 절차입니다. 사용자 로그인 시 주로 수행됩니다.
- **인가(Authorization)**: 인증된 사용자가 특정 리소스에 접근할 권한이 있는지 확인하는 절차입니다. 예를 들어, 관리자 페이지와 같은 특정 영역에 대한 접근을 제어할 때 사용됩니다.

## **4.2 Passport.js로 인증 설정 추가**

Passport.js는 다양한 인증 방법을 지원하는 Node.js용 미들웨어입니다. 여기서는 로컬 인증 전략을 사용하여 기본적인 로그인 기능을 구현합니다.

1. **필수 모듈 설치**
    
    ```bash
    npm install passport passport-local express-session
    ```
    
2. **Passport.js 설정**
    
    ```jsx
    const express = require('express');
    const passport = require('passport');
    const LocalStrategy = require('passport-local').Strategy;
    const session = require('express-session');
    
    const app = express();
    
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.set('view engine', 'ejs');
    app.set('views', './views');
    
    app.use(session({
        secret: 'secret-key',
        resave: false,
        saveUninitialized: false
    }));
    
    app.use(passport.initialize());
    app.use(passport.session());
    
    passport.use(new LocalStrategy(
        function(username, password, done) {
            const user = users.find(u => u.username === username && u.password === password);
            return user ? done(null, user) : done(null, false, { message: 'Invalid credentials' });
        }
    ));
    
    passport.serializeUser((user, done) => {
        done(null, user.username);
    });
    
    passport.deserializeUser((username, done) => {
        const user = users.find(u => u.username === username);
        done(null, user);
    });
    
    app.listen(3000, () => console.log(`Server running on http://localhost:3000`));
    ```
    

## **4.3 회원 가입 및 로그인 구현**

사용자 정보를 저장할 간단한 배열과 회원 가입, 로그인 페이지를 구현합니다.

- **회원 가입 페이지 및 처리 로직**
    
    ```html
    <!-- views/register.ejs -->
    <form action="/register" method="post">
        <input type="text" name="username" placeholder="Username" required>
        <input type="password" name="password" placeholder="Password" required>
        <button type="submit">Register</button>
    </form>
    ```
    
    ```jsx
    // app.js
    const users = [];  // 사용자 정보 저장 배열
    
    app.post('/register', (req, res) => {
        const { username, password } = req.body;
        users.push({ username, password });
        res.redirect('/login');
    });
    ```
    
- **로그인 페이지 및 처리 로직**
    
    ```html
    <!-- views/login.ejs -->
    <form action="/login" method="post">
        <input type="text" name="username" placeholder="Username" required>
        <input type="password" name="password" placeholder="Password" required>
        <button type="submit">Login</button>
    </form>
    ```
    
    ```jsx
    // app.js
    app.post('/login', passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login'
    }));
    
    app.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/login');
    });
    ```
    

## **4.4 페이지 권한 설정**

- **인증 및 관리자 권한 확인 미들웨어 소스코드 추가**
    
    ```jsx
    // app.js
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
    
    app.get('/profile', ensureAuthenticated, (req, res) => {
        res.send(`Welcome, ${req.user.username}`);
    });
    
    app.get('/admin', ensureAdmin, (req, res) => {
        res.send('Welcome to admin page');
    });
    ```
    

## 4.5 전체 소스코드

- app.js 전체 소스 코드
    
    ```jsx
    const express = require('express');
    const passport = require('passport');
    const LocalStrategy = require('passport-local').Strategy;
    const session = require('express-session');
    
    const app = express();
    const port = 3000;
    
    app.use(express.json()); // JSON 요청 본문을 파싱
    app.set('view engine', 'ejs'); // EJS를 템플릿 엔진으로 설정
    app.set('views', './views');   // 뷰 파일들이 위치한 폴더 설정
    
    // 세션 설정
    app.use(session({
        secret: 'secret-key', // 세션을 암호화하기 위한 비밀키
        resave: false,        // 세션을 항상 저장할지 여부
        saveUninitialized: false // 초기화되지 않은 세션을 저장할지 여부
    }));
    
    // Passport 초기화 및 세션 연결
    app.use(passport.initialize());
    app.use(passport.session());
    
    const bodyParser = require('body-parser');
    const users = [
        { username: 'user1', password: '1234' },
        { username: 'admin', password: 'password' }
    ]; // 간단한 배열로 사용자 저장 (데이터베이스 사용 가능)
    
    app.use(bodyParser.urlencoded({ extended: false })); // URL 인코딩된 데이터를 파싱
    
    // 사용자 인증 전략 정의
    // passport.use(new LocalStrategy(
    //     function(username, password, done) {
    //       // 여기서 사용자 정보 확인 (예: 데이터베이스에서 확인)
    //       if (username === 'admin' && password === 'password') {
    //         return done(null, { username: 'admin' });
    //       } else {
    //         return done(null, false, { message: 'Invalid credentials' });
    //       }
    //     }
    // ));
    
    // Passport를 사용한 사용자 인증 설정 (users 데이터로 비교)
    passport.use(new LocalStrategy(
        function(username, password, done) {
            // users 배열에서 사용자 정보 찾기
            const user = users.find(u => u.username === username && u.password === password);
            if (user) {
                return done(null, user);  // 사용자 인증 성공
            } else {
                return done(null, false, { message: 'Invalid credentials' });  // 사용자 인증 실패
            }
        }
    ));
    
    // 세션에 사용자 정보를 저장 및 추출
    passport.serializeUser((user, done) => {
        done(null, user.username); // 사용자 세션에 username만 저장
    });
    
    passport.deserializeUser((username, done) => {
        // 사용자 정보 복원
        const user = users.find(u => u.username === username);
        done(null, user);
    });
    
    // 회원가입 경로 설정
    app.get('/register', (req, res) => {
        res.render('register'); // 회원가입 페이지 렌더링
    });
    
    app.post('/register', (req, res) => {
        const { username, password } = req.body;
        users.push({ username, password }); // 사용자 배열에 새로운 사용자 추가
        res.redirect('/login'); // 로그인 페이지로 리디렉션
    });
    
    // 로그인 경로 설정
    app.get('/login', (req, res) => {
        res.render('login');  // 로그인 페이지 렌더링
    });
    
    app.post('/login', passport.authenticate('local', {
        successRedirect: '/',         // 로그인 성공 시 리디렉션 경로
        failureRedirect: '/login'     // 로그인 실패 시 리디렉션 경로
    }));
    
    // 로그아웃 경로 설정
    app.get('/logout', (req, res) => {
        req.logout(); // 사용자 로그아웃
        res.redirect('/login'); // 로그인 페이지로 리디렉션
    });
    
    // 인증된 사용자만 접근 가능한 경로 설정
    function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
            return next(); // 인증된 경우 요청 처리 계속
        }
        res.redirect('/login'); // 인증되지 않은 경우 로그인 페이지로 리디렉션
    }
    
    // 관리자만 접근 가능한 경로 설정
    function ensureAdmin(req, res, next) {
        if (req.isAuthenticated() && req.user.username === 'admin') {
            return next(); // 관리자인 경우 요청 처리 계속
        }
        res.status(403).send('Access denied'); // 관리자가 아닌 경우 접근 거부
    }
    
    // 일반 사용자 접근 가능
    app.get('/profile', ensureAuthenticated, (req, res) => {
        res.send(`Welcome, ${req.user.username}`); // 프로필 페이지 응답
    });
    
    // 관리자만 접근 가능
    app.get('/admin', ensureAdmin, (req, res) => {
        res.send('Welcome to admin page'); // 관리자 페이지 응답
    });
    
    // 서버 실행
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
    ```