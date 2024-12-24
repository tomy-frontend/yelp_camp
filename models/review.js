const mongoose = require("mongoose");
const { Schema } = mongoose;

const reviewSchema = new Schema({
  body: string,
  rating: number,
});

module.exports = mongoose.model("Review", "reviewSchema");
