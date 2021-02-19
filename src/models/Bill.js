const mongoose = require("mongoose")

const BillSchema = mongoose.Schema({
    user: String,
    date: Date,
    bill_type: String,
    receipt_number: Number,
    amount: Number,
    fiscal_year: String
});

module.exports = mongoose.model("Bill", BillSchema);