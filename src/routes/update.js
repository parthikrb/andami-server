const express = require("express");
const User = require("../models/User");
const Bill = require("../models/Bill");
const updateRouter = express.Router();

updateRouter.patch("/api/users/:id", async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id })

        if (req.body.first_name) user.first_name = req.body.first_name
        if (req.body.last_name) user.last_name = req.body.last_name
        if (req.body.mobile) user.mobile = req.body.mobile
        if (req.body.door_number) user.door_number = req.body.door_number
        if (req.body.street_name) user.street_name = req.body.street_name
        if (req.body.ward_number) user.ward_number = req.body.ward_number

        await user.save();
        res.send(post);
    } catch {
        res.status(404)
        res.send({ error: "User doesn't exist!" })
    }
});

updateRouter.patch("/api/bills/:id", async (req, res) => {
    try {
        const bill = await Bill.findOne({ _id: req.params.id })

        if (req.body.user) bill.user = req.body.user
        if (req.body.bill_type) bill.bill_type = req.body.bill_type
        if (req.body.receipt_number) bill.receipt_number = req.body.receipt_number
        if (req.body.amount) bill.amount = req.body.amount
        if (req.body.fiscal_year) bill.fiscal_year = req.body.fiscal_year

        await bill.save()
        res.send(bill)
    } catch {
        res.status(404)
        res.send({ error: "User doesn't exist!" })
    }
});

module.exports = updateRouter;