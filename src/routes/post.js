const express = require("express");
const User = require("../models/User");
const Bill = require("../models/Bill");
const postRouter = express.Router();

postRouter.post("/api/user", async (req, res) => {
    const { first_name, last_name, mobile, door_number, street_name, ward_number } = req.body;
    const user = new User({
        first_name,
        last_name,
        mobile,
        door_number,
        street_name,
        ward_number
    });
    await user.save();
    res.send(user);
});

postRouter.post("/api/bill", async (req, res) => {
    const { user, date, bill_type, receipt_number, amount, fiscal_year } = req.body;
    const bill = new Bill({
        user,
        date,
        bill_type,
        receipt_number,
        amount,
        fiscal_year
    });
    bill.save();
    res.send(bill);
});

module.exports = postRouter;