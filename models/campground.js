const mongoose = require("mongoose");
const { Schema } = mongoose;

// キャンプ場のスキーマ
const campgroundSchema = new Schema({
  title: String,
  image: String,
  price: Number,
  description: String,
  location: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

module.exports = mongoose.model("Campground", campgroundSchema); // 別ファイルから使用できるようにexports
