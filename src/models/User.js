const mongoose = require("mongoose")

const UserSchema = mongoose.Schema({
    first_name: String,
    last_name: String,
    mobile: Number,
    door_number: String,
    street_name: String,
    ward_number: Number,
})

module.exports = mongoose.model("User", UserSchema)