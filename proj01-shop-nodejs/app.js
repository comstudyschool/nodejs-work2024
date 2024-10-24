const express = require('express');
const app = express();
const port = 3000;

const { Item } = require('./models');

app.use(express.json());

const mysql = require('mysql2');
const { Op } = require('sequelize');
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

// 로깅 미들웨어
const logger = (req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
};
app.use(logger);

// 에러 미들웨어
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.get('/', (req, res) => {
    res.send('Hello World');
});

// 상품 저장
app.post('/items', async (req, res) => {
    const { name, price, description } = req.body;
    const item = await Item.create({ name, price, description });
    res.status(201).json(item);
});

// 전체 상품 조회
app.get('/items', async (req, res) => {
    const items = await Item.findAll();
    res.status(200).json(items);
});

// 상품 상세 조회
app.get('/items/:id', async (req, res) => {
    const item = await Item.findByPk(req.params.id);
    if (item) {
        res.status(200).json(item);
    } else {
        res.status(404).send('Item not found');
    }
});

// 조건부 조회
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

// 정렬 및 페이징
app.get('/items3', async (req, res) => {
    const items = await Item.findAll({
      order: [['price', 'DESC']],  // 가격 내림차순 정렬
      limit: 10,                   // 최대 10개까지 조회
    });
    res.status(200).json(items);
});


// 서버 실행
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
