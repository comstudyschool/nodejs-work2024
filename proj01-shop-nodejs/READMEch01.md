# **1.1 Node.js Express 특징**

- **Express.js**는 경량 웹 프레임워크로, 설정이 간편하고 신속한 웹 애플리케이션 개발이 가능합니다.
- **미들웨어** 구조를 통해 요청/응답을 처리하고, 애플리케이션 로직을 모듈화하여 효율적으로 관리할 수 있습니다.
- **JAR 대신 NPM 패키지**로 필요한 라이브러리를 관리하며, 각종 미들웨어 및 유틸리티를 쉽게 추가할 수 있습니다.
- **실행 및 배포**는 `node app.js` 명령으로 실행하며, Heroku, AWS, Vercel 등의 다양한 클라우드 플랫폼에서 배포할 수 있습니다.

---

# **1.2 Node.js 설치**

Node.js 설치는 스프링 부트의 JDK 설치와 비슷한 단계입니다.

1. [Node.js 공식 사이트](https://nodejs.org/)에서 LTS 버전의 Node.js를 다운로드하고 설치합니다.
2. 설치가 완료되면 터미널에서 `node -v` 및 `npm -v` 명령으로 설치된 버전 확인.

---

# **1.3 Express 프로젝트 초기화**

1. 프로젝트 폴더 생성 후 `npm init` 명령으로 `package.json` 파일 생성.
2. **Express.js 및 중요 모듈 설치**:
    
    ```bash
    npm init -y
    npm install express cors --save
    npm install nodemon --save-dev
    ```
    
3. **package.json 스크립트 추가**
    
    ```json
    {
      "name": "proj01-shop-nodejs",
      "version": "1.0.0",
      "main": "index.js",
      **"scripts": {
        "dev": "nodemon app.js",
        "start": "node app.js",
        "test": "echo \"Error: no test specified\" && exit 1"
      },**
      "keywords": [],
      "author": "",
      "license": "ISC",
      "description": "",
      "dependencies": {
        "cors": "^2.8.5",
        "express": "^4.21.1"
      },
      "devDependencies": {
        "nodemon": "^3.1.7"
      }
    }
    ```
    

---

# **1.4 Express 애플리케이션 실행**

Express에서도 기본적인 서버 설정을 하고 실행합니다.

1. **Express 서버 설정 (app.js)**:
    
    ```jsx
    const express = require('express');
    const app = express();
    const port = 3000;
    
    app.get('/', (req, res) => {
      res.send('Hello World');
    });
    
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
    ```
    
2. **개발 환경 서버 실행**:
    
    ```bash
    npm run dev
    ```
    
3. 브라우저에서 `http://localhost:3000`에 접속하면 "Hello World"가 출력됩니다.

---

# **1.5 Express 미들웨어 활용**

Express에서는 **미들웨어**를 통해 로깅, 에러 처리, 데이터 유효성 검사 등을 구현할 수 있습니다.

1. **로깅 미들웨어**
    
    ```jsx
    const logger = (req, res, next) => {
      console.log(`${req.method} ${req.url}`);
      next();
    };
    
    app.use(logger);
    
    ```
    
2. **에러 미들웨어**
    
    ```jsx
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).send('Something broke!');
    });
    
    ```
    

---

### **1.6 MySQL 설치 및 연동**

Node.js 프로젝트에서도 MySQL을 사용하여 데이터베이스와 연동할 수 있습니다.  **`mysql2`** 패키지를 통해 MySQL을 연결합니다.

- MySQL 접속 및 데이터베이스 생성
    
    ```bash
    # cmd에서 mysql 접속
    mysql -uroot -p1234
    
    # mysql 명령프롬프트에서 데이터베이스 생성
    create database shopping_mall
    # 데이터베이스 목록
    show databases;
    ```
    
1. **MySQL 패키지 설치**:
    
    ```bash
    npm install mysql2
    ```
    
2. **MySQL 연결 설정 추가**
    - app.js에 추가 후 재실행
    
    ```jsx
    const mysql = require('mysql2');
    const connection = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '1234',
      database: 'shopping_mall'
    });
    
    connection.connect((err) => {
      if (err) throw err;
      console.log('Connected to MySQL');
    });
    ```
    
    - 실행 결과
    
    ```bash
    Server running on http://localhost:3000
    Connected to MySQL
    ```
    

---

### **Note) Express.js와 스프링 부트의 주요 차이점 요약**

| **스프링 부트** | **Node.js Express** |
| --- | --- |
| 내장 WAS (Tomcat, Jetty) | 경량 서버 실행 (Express) |
| JAR 배포 | `node` 명령어로 서버 실행 |
| Lombok 어노테이션 | 미들웨어를 통한 기능 구현 |
| Maven/Gradle 빌드 도구 | NPM 패키지 매니저 사용 |
| Spring Data JPA로 DB 연결 | `mysql2` 패키지를 통해 MySQL 연결 |