const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const MONGODB = 'mongodb+srv://yash:yash2001@cluster0.egcdu2f.mongodb.net/?retryWrites=true&w=majority';
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

const app = express();
const port = 4000;

/********** Middlewares ************/
// Allow Cors request from react app port
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000'); // update to match the domain you will make the request from
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS,PUT,DELETE');
    next();
});

app.use(express.urlencoded({ extended: true }));
// app.use(express.static('uploads'));

app.use('/uploads', express.static('uploads'));

app.use(bodyParser.json());
app.use('/auth', authRoutes);
app.use('/user', userRoutes);

//Base Route
app.get('/', function (req, res) {
    res.send('hello world');
});

mongoose
    .connect(MONGODB, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB Connected Successfully');
        return app.listen({ port: port });
    })
    .then(() => {
        console.log(`🚀 Server ready at http://localhost:${port}`);
    })
    .catch((e) => console.log(e));
