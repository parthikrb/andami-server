const express = require("express");
const User = require("../models/User");
const Bill = require("../models/Bill");
const indexRouter = express.Router();

indexRouter.get("/api/users", async (req, res) => {
    const users = await User.find().exec();
    res.send(users);
});

indexRouter.get("/api/bills", async (req, res) => {
    const bills = await Bill.find().exec();
    res.send(bills);
});

module.exports = indexRouter;