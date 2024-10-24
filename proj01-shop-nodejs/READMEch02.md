# **2장. Spring Data JPA를 Node.js로 변환하기**

### **2.1 Node.js ORM 선택: Sequelize**

Node.js에서는 ORM으로 **Sequelize**를 많이 사용합니다. Sequelize는 SQL 데이터베이스와의 상호작용을 위한 ORM 라이브러리입니다.

1. **Sequelize 설치**:
    
    ```bash
    npm install sequelize sequelize-cli mysql2
    ```
    
2. **Sequelize 초기화**:
    
    ```bash
    npx sequelize-cli init
    ```
    
    이 명령은 `config`, `models`, `migrations`, `seeders` 디렉터리를 생성합니다.
    
    - config/config.json (init 명령 후 **자동 생성**)
        
        ```json
        {
          "development": {
            "username": "root",
            "password": null,
            "database": "database_development",
            "host": "127.0.0.1",
            "dialect": "mysql"
          },
          "test": {
            "username": "root",
            "password": null,
            "database": "database_test",
            "host": "127.0.0.1",
            "dialect": "mysql"
          },
          "production": {
            "username": "root",
            "password": null,
            "database": "database_production",
            "host": "127.0.0.1",
            "dialect": "mysql"
          }
        }
        ```
        
    - models/index.js (init 명령 후 **자동 생성**)
        
        ```jsx
        'use strict';
        
        const fs = require('fs');
        const path = require('path');
        const Sequelize = require('sequelize');
        const process = require('process');
        const basename = path.basename(__filename);
        const env = process.env.NODE_ENV || 'development';
        const config = require(__dirname + '/../config/config.json')[env];
        const db = {};
        
        let sequelize;
        if (config.use_env_variable) {
          sequelize = new Sequelize(process.env[config.use_env_variable], config);
        } else {
          sequelize = new Sequelize(config.database, config.username, config.password, config);
        }
        
        fs
          .readdirSync(__dirname)
          .filter(file => {
            return (
              file.indexOf('.') !== 0 &&
              file !== basename &&
              file.slice(-3) === '.js' &&
              file.indexOf('.test.js') === -1
            );
          })
          .forEach(file => {
            const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
            db[model.name] = model;
          });
        
        Object.keys(db).forEach(modelName => {
          if (db[modelName].associate) {
            db[modelName].associate(db);
          }
        });
        
        db.sequelize = sequelize;
        db.Sequelize = Sequelize;
        
        module.exports = db;
        
        ```
        
3. **데이터베이스 설정** (`config/config.json`) (**수정**)
    
    ```json
    {
      "development": {
        "username": "root",
        "password": "1234",
        "database": "shopping_mall",
        "host": "127.0.0.1",
        "dialect": "mysql"
      }
    }
    ```
    

---

### **2.2 상품 엔티티 생성**

Sequelize에서 모델을 생성합니다. (자바 JPA의 `@Entity`와 같은 역할)

1. **Sequelize 모델 생성**:
    
    ```bash
    npx sequelize-cli model:generate --name Item --attributes name:string,price:integer,description:string
    ```
    
2. **생성된 모델 (`models/item.js`) (자동 생성)**
    
    ```jsx
    /*
    module.exports = (sequelize, DataTypes) => {
      const Item = sequelize.define('Item', {
        name: DataTypes.STRING,
        price: DataTypes.INTEGER,
        description: DataTypes.STRING,
      });
      return Item;
    };
    */
    
    'use strict';
    const { Model } = require('sequelize');
    module.exports = (sequelize, DataTypes) => {
      class Item extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
          // define association here
        }
      }
      Item.init({
        name: DataTypes.STRING,
        price: DataTypes.INTEGER,
        description: DataTypes.STRING
      }, {
        sequelize,
        modelName: 'Item',
      });
      return Item;
    };
    ```
    
3. **마이그레이션 실행**:
    
    ```bash
    npx sequelize-cli db:migrate
    ```
    
4. **migrations/20241024131905-create-item.js (자동 생성)**
    
    ```jsx
    'use strict';
    /** @type {import('sequelize-cli').Migration} */
    module.exports = {
      async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Items', {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
          },
          name: {
            type: Sequelize.STRING
          },
          price: {
            type: Sequelize.INTEGER
          },
          description: {
            type: Sequelize.STRING
          },
          createdAt: {
            allowNull: false,
            type: Sequelize.DATE
          },
          updatedAt: {
            allowNull: false,
            type: Sequelize.DATE
          }
        });
      },
      async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Items');
      }
    };
    ```
    
5. 데이터베이스 에서 테이블 생성 확인
    
    ```sql
    mysql> use shopping_mall
    Database changed
    mysql> show tables;       
    +-------------------------+
    | Tables_in_shopping_mall |
    +-------------------------+
    | items                   |
    | sequelizemeta           |
    +-------------------------+
    2 rows in set (0.00 sec)
    
    mysql> desc items;
    +-------------+--------------+------+-----+---------+----------------+
    | Field       | Type         | Null | Key | Default | Extra          |
    +-------------+--------------+------+-----+---------+----------------+
    | id          | int          | NO   | PRI | NULL    | auto_increment |
    | name        | varchar(255) | YES  |     | NULL    |                |
    | price       | int          | YES  |     | NULL    |                |
    | price       | int          | YES  |     | NULL    |                |
    | price       | int          | YES  |     | NULL    |                |
    | description | varchar(255) | YES  |     | NULL    |                |
    | createdAt   | datetime     | NO   |     | NULL    |                |
    | updatedAt   | datetime     | NO   |     | NULL    |                |
    +-------------+--------------+------+-----+---------+----------------+
    6 rows in set (0.01 sec)
    
    mysql>
    ```
    

---

### **2.3 Repository 역할: CRUD 구현**

Sequelize를 사용하여 기본적인 데이터베이스 작업을 구현할 수 있습니다.

1. **상품 저장 (Create)**:
    
    ```jsx
    const express = require('express');
    const { Item } = require('./models');
    
    const app = express();
    app.use(express.json());
    
    app.post('/items', async (req, res) => {
      const { name, price, description } = req.body;
      const item = await Item.create({ name, price, description });
      res.status(201).json(item);
    });
    
    app.listen(3000, () => console.log('Server running on port 3000'));
    
    ```
    
2. **상품 조회 (Read)**:
    
    ```jsx
    app.get('/items', async (req, res) => {
      const items = await Item.findAll();
      res.status(200).json(items);
    });
    
    app.get('/items/:id', async (req, res) => {
      const item = await Item.findByPk(req.params.id);
      if (item) {
        res.status(200).json(item);
      } else {
        res.status(404).send('Item not found');
      }
    });
    ```
    

### Postman으로 입/출력 테스트 및 DB 확인

- 포스트맨 실행 (VS-Code에 플러그인 기능으로 가능)
    
    ![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/73d32148-7b0b-42ac-9b0b-2bfaa5903e80/cd411e5b-a1b9-4c7e-aa7d-3df96798e6d3/image.png)
    

---

### **2.4 데이터베이스 초기화 전략**

Sequelize는 **마이그레이션**을 통해 데이터베이스 스키마를 관리합니다.

1. **마이그레이션 명령어**:
    - `npx sequelize-cli db:migrate`: 마이그레이션 실행
    - `npx sequelize-cli db:migrate:undo`: 마지막 마이그레이션 롤백

---

### **2.5 Sequelize에서 복잡한 쿼리**

Sequelize에서도 `findAll()` 메소드에 조건을 전달하여 복잡한 쿼리를 작성할 수 있습니다.

1. **조건부 조회**:
    
    ```jsx
    app.get('/items2', async (req, res) => {
      const items = await Item.findAll({
        where: {
          price: {
            [Op.gte]: 1000,  // 가격이 1000 이상인 상품 조회
          }
        }
      });
      res.status(200).json(items);
    });
    ```
    
2. **정렬 및 페이징**:
    
    ```jsx
    app.get('/items3', async (req, res) => {
      const items = await Item.findAll({
        order: [['price', 'DESC']],  // 가격 내림차순 정렬
        limit: 10,                   // 최대 10개까지 조회
      });
      res.status(200).json(items);
    });
    
    ```
    

---