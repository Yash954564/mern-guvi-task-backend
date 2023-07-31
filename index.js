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
    res.header('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
    res.header('Access-Control-Allow-Headers', '*'); // Allow all headers
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE');
    next();
});

app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.json());
app.use('/auth', authRoutes);
app.use('/user', userRoutes);

// Base Route
app.get('/', (req, res) => {
    res.send('hello world');
});

async function connectToMongoDB() {
    try {
        await mongoose.connect(MONGODB, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('MongoDB Connected Successfully');
    } catch (error) {
        console.error('MongoDB Connection Error:', error);
    }
}

async function startServer() {
    try {
        await connectToMongoDB();
        app.listen(port, () => {
            console.log(`🚀 Server ready at http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Error starting the server:', error);
    }
}

startServer();
