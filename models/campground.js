const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// キャンプ場のスキーマ
const campgroundSchema = new Schema({
  title: String,
  image: String,
  price: Number,
  description: String,
  location: String,
});

module.exports = mongoose.model("Campground", campgroundSchema); // 別ファイルから使用できるようにexports
