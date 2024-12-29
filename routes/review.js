const express = require("express");
const router = express.Router({ mergeParams: true }); // mergeParamsで明示的に宣言する必要がある。親からIDが渡ってくるようになる
const catchAsync = require("../utils/catchAsync");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");
const review = require("../controllers/reviews");

// reviewの投稿追加のルーティング
// + Joiでサーバーサイドのバリデーションチェック
// + catchAsync関数 → 非同期処理でエラーがあったらエラーハンドリングミドルウェアに渡すミドルウェア
router.post("/", isLoggedIn, validateReview, catchAsync(review.createReview));

// レビューの削除ルーティング
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(review.deleteReview)
);

module.exports = router;
