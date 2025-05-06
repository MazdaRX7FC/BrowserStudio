const mongoose = require("mongoose");

// Schema for storing feedback
const FeedbackSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    feedback: String
}, { versionKey: false }); // disables __v field in MongoDB

const Feedback = mongoose.model("Feedback", FeedbackSchema);

module.exports = Feedback;
