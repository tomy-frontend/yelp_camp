const express = require("express");
const router = express.Router({ mergeParams: true }); // mergeParamsで明示的に宣言する必要がある。親からIDが渡ってくるようになる
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");
const Review = require("../models/review");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");

// reviewの投稿追加のルーティング
// + Joiでサーバーサイドのバリデーションチェック
// + catchAsync関数 → 非同期処理でエラーがあったらエラーハンドリングミドルウェアに渡すミドルウェア
router.post(
  "/",
  isLoggedIn,
  validateReview,
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id; // req.user.id ではなく req.user._id を使用
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "レビューを投稿しました!");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

// レビューの削除ルーティング
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    // 1. キャンプ場のドキュメントから特定のレビューIDを取り除く
    // $pullは配列から特定の要素を取り除くMongoDBの演算子
    // reviews配列から reviewId と一致する要素を削除
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); // campgroundの中で参照しているreviewsの中から、対象のreviewを取り除いてアップデートする

    // 2. レビューコレクションから実際のレビュードキュメントを完全に削除する
    await Review.findByIdAndDelete(reviewId); // 対象のレビュー自体を削除する
    req.flash("success", "レビューを削除しました!");
    res.redirect(`/campgrounds/${id}`);
  })
);

module.exports = router;
