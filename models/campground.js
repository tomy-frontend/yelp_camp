const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// キャンプ場のスキーマ
const campgroundSchema = new Schema({
  title: String,
  price: String,
  description: String,
  location: String,
});

module.exports = mongoose.model("Campground", campgroundSchema); // 別ファイルから使用できるようにexports
