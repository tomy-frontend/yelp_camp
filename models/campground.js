const mongoose = require("mongoose");
const Review = require("./review");
const { Schema } = mongoose;

const imageSchema = new Schema({
  url: String,
  filename: String,
});

imageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

const opts = { toJSON: { virtuals: true } };

// キャンプ場のスキーマ作成
const campgroundSchema = new Schema(
  {
    title: String,
    images: [imageSchema],
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    price: Number,
    description: String,
    location: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  opts
);

campgroundSchema.virtual("properties.popupMarkup").get(function () {
  return `<strong><a href="/campgrounds/${this._id}" >${this.title}</a></strong>
  <p>${this.description.substring(0, 20)}...</p>`;
});

// キャンプ場が削除されると、紐づいているreviewも削除する関数
const deleteFunc = async function (doc) {
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
  }
};

// キャンプ場が削除されると、reviewも削除するミドルウェア
campgroundSchema.post("findOneAndDelete", deleteFunc);

module.exports = mongoose.model("Campground", campgroundSchema); // 別ファイルから使用できるようにexports
