const Campground = require("../models/campground");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review);
  review.author = req.user._id; // req.user.id ではなく req.user._id を使用
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  req.flash("success", "レビューを投稿しました!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  // 1. キャンプ場のドキュメントから特定のレビューIDを取り除く
  // $pullは配列から特定の要素を取り除くMongoDBの演算子
  // reviews配列から reviewId と一致する要素を削除
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); // campgroundの中で参照しているreviewsの中から、対象のreviewを取り除いてアップデートする

  // 2. レビューコレクションから実際のレビュードキュメントを完全に削除する
  await Review.findByIdAndDelete(reviewId); // 対象のレビュー自体を削除する
  req.flash("success", "レビューを削除しました!");
  res.redirect(`/campgrounds/${id}`);
};
