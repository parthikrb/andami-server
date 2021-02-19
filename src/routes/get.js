const express = require("express");
const User = require("../models/User");
const Bill = require("../models/Bill");
const getRouter = express.Router();

getRouter.get("/api/users/:id", async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id })
        res.send(user);
    } catch {
        res.status(404)
        res.send({ error: "User doesn't exist!" })
    }
});

getRouter.get("/api/users/:id/bills", async (req, res) => {
    try {
        const bills = await Bill.find({ user: req.params.id }).exec();
        res.send(bills);
    } catch {
        res.status(404)
        res.send({ error: "User doesn't exist!" })
    }
});

getRouter.get("/api/bills/:id", async (req, res) => {
    try {
        const bill = await Bill.findOne({ _id: req.params.id })
        res.send(bill);
    } catch {
        res.status(404)
        res.send({ error: "Bill doesn't exist!" })
    }
});

module.exports = getRouter;