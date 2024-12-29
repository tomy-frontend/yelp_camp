const ExpressError = require("./utils/ExpressError");
const { campgroundSchema, reviewSchema } = require("./schemas");
const Campground = require("./models/campground");
const Review = require("./models/review");

// ログイン状態をチェックするミドルウェア
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // もともとリクエストした場所を保存しておく
    // req.pathは、/new , req.originalUrlは、 /campgrounds/new の完全なパスがくる
    req.session.returnTo = req.originalUrl;
    req.flash("error", "ログインしてください。");
    return res.redirect("/login");
  }
  next();
};

// 新規追加と更新の際のバリデーションチェック自作ミドルウェア
module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((detail) => detail.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next(); // 問題なければ次の処理に進む(必須！これがないと処理止まる)
  }
};

// 認証用ミドルウェア
module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  // 一致しなければflashでメッセージ + リダイレクト処理
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "そのアクションの権限がありません。");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

// コメント用の認証用ミドルウェア
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  // 一致しなければflashでメッセージ + リダイレクト処理
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "そのアクションの権限がありません。");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

// reviewのバリデーションチェック自作ミドルウェア
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((detail) => detail.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next(); // 問題なければ次の処理に進む(必須！これがないと処理止まる)
  }
};
