// UserSchema.js

const mongoose = require("mongoose");

// Create a new Schema for users
const UserSchema = new mongoose.Schema({
    username: String,
    password: String
}, { versionKey: false }); //do not put that thing in my database document

const User = mongoose.model("User", UserSchema);

module.exports = User;