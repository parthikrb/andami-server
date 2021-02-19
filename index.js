const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');
const bodyParser = require('body-parser')
require('dotenv').config();

const indexRouter = require('./src/routes/index');
const getRouter = require('./src/routes/get');
const postRouter = require('./src/routes/post');
const updateRouter = require('./src/routes/update');
const deleteRouter = require('./src/routes/delete');

const port = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(indexRouter);
app.use(getRouter);
app.use(postRouter);
app.use(updateRouter);
app.use(deleteRouter);

// Connect to MongoDB database
const startApp = async () => {
    await mongoose.connect(process.env.DB_URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true
    }).catch(err => {
        console.error(err.message);
    });
    app.listen(port, () => {
        console.log(`Listening on PORT ${port}`);
    });
}

startApp(); 
