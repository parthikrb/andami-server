const express = require("express");
const User = require("../models/User");
const Bill = require("../models/Bill");
const deleteRouter = express.Router();

deleteRouter.delete("/api/users", async (req, res) => {
    try {
        await User.deleteOne({ _id: req.params.id })
        res.status(204).send()
    } catch {
        res.status(404)
        res.send({ error: "User doesn't exist!" })
    }
});

deleteRouter.delete("/api/bills", async (req, res) => {
    try {
        await Bill.deleteOne({ _id: req.params.id })
        res.status(204).send()
    } catch {
        res.status(404)
        res.send({ error: "Bill doesn't exist!" })
    }
});

module.exports = deleteRouter;