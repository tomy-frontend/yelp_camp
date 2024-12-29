const express = require("express");
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/campground");
const campground = require("../models/campground");
const { campgroundSchema } = require("../schemas");
const { isLoggedIn } = require("../middleware");
const router = express.Router();

// 新規追加と更新の際のバリデーションチェック自作ミドルウェア
const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((detail) => detail.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next(); // 問題なければ次の処理に進む(必須！これがないと処理止まる)
  }
};

// campgroundルーティング(indexページ)
router.get(
  "/",
  catchAsync(async (req, res) => {
    const campgrounds = await campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

// 新規追加ページパスのルーティング(ルーティングの場所に注意！)
// isLoggedInミドルウェアでログイン状態の場合のみアクセス可能
router.get("/new", isLoggedIn, (req, res) => {
  res.render("campgrounds/new");
});

// 新規登録フォームの送信先のルーティング
// + validateCampground関数 → Joiでサーバーサイドのバリデーションをするミドルウェア
// + catchAsync関数 → 非同期処理でエラーがあったらエラーハンドリングミドルウェアに渡すミドルウェア
router.post(
  "/",
  isLoggedIn,
  validateCampground,
  catchAsync(async (req, res) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id; // 今ログインしているユーザーをauthorとして登録する
    await campground.save();
    req.flash("success", "新しいキャンプ場を登録しました！");
    res.redirect(`/campgrounds/${campground._id}`); // 追加完了後は個別詳細ページにリダイレクト
  })
);

// 詳細ページパスへのルーティング
router.get(
  "/:id",
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
      .populate("reviews")
      .populate("author");
    // 削除された等でcampgroundがなかった時の処理&flashでエラーの文言を表示する
    if (!campground) {
      req.flash("error", "キャンプ場は見つかりませんでした。");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground });
  })
);

// 編集ページパスのルーティング
router.get(
  "/:id/edit",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
      req.flash("error", "キャンプ場は見つかりませんでした。");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground });
  })
);

// 編集処理完了後のフォーム送信後のルーティング
// + validateCampground関数 → Joiでサーバーサイドのバリデーションをするミドルウェア
// + catchAsync関数 → 非同期処理でエラーがあったらエラーハンドリングミドルウェアに渡すミドルウェア
router.put(
  "/:id",
  isLoggedIn,
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    // 分割代入でそれぞれに値が入る
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    req.flash("success", "キャンプ場を更新しました!");
    res.redirect(`/campgrounds/${campground._id}`); // 更新完了後は個別詳細ページにリダイレクト
  })
);

// キャンプ場の削除ルーティング
router.delete(
  "/:id",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "キャンプ場を削除しました!");
    res.redirect("/campgrounds"); // 削除後は一覧ページにリダイレクト
  })
);

module.exports = router;
