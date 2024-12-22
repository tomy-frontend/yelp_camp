const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const Campground = require("./models/campground");
const campground = require("./models/campground");
const morgan = require("morgan");
const ejsMate = require("ejs-mate");
const catchAsync = require("./utils/catchAsync"); // エラーハンドリング自作クラスの呼び出し
const ExpressError = require("./utils/ExpressError");
const { campgroundSchema } = require("./shemas");

// mongooseへの接続
mongoose
  .connect("mongodb://localhost:27017/yelp-camp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("MongoDB接続完了!");
  })
  .catch((error) => {
    console.log("MongoDB接続エラー!", error);
  });

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(morgan("dev"));

// 特定ルートへのミドルウェア作成(個別詳細ページ限定のミドルウェア)
app.use("/campgrounds/:id", (req, res, next) => {
  console.log(`ID: ${req.params.id}ページへのアクセス`);
  return next();
});

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

// ホームディレクトリのルーティング
app.get("/", (req, res) => {
  res.render("home");
});

// campgroundルーティング(indexページ)
app.get(
  "/campgrounds",
  catchAsync(async (req, res) => {
    const campgrounds = await campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

// 新規追加ページパスのルーティング(ルーティングの場所に注意！)
app.get(
  "/campgrounds/new",
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/new");
  })
);

// 新規登録フォームの送信先のルーティング
// + validateCampground関数 → Joiでサーバーサイドのバリデーションをするミドルウェア
// + catchAsync関数 → 非同期処理でエラーがあったらエラーハンドリングミドルウェアに渡すミドルウェア
app.post(
  "/campgrounds",
  validateCampground,
  catchAsync(async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`); // 追加完了後は個別詳細ページにリダイレクト
  })
);

// 詳細ページパスへのルーティング
app.get(
  "/campgrounds/:id",
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/show", { campground });
  })
);

// 編集ページパスのルーティング
app.get(
  "/campgrounds/:id/edit",
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", { campground });
  })
);

// 編集処理完了後のフォーム送信後のルーティング
// + validateCampground関数 → Joiでサーバーサイドのバリデーションをするミドルウェア
// + catchAsync関数 → 非同期処理でエラーがあったらエラーハンドリングミドルウェアに渡すミドルウェア
app.put(
  "/campgrounds/:id",
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    // 分割代入でそれぞれに値が入る
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    res.redirect(`/campgrounds/${campground._id}`); // 更新完了後は個別詳細ページにリダイレクト
  })
);

// 削除ルーティング
app.delete(
  "/campgrounds/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds"); // 一覧ページにリダイレクト
  })
);

// 全てのメソッドのどんなパスでも対象にするルーティングで404ページを作成
app.all("*", (req, res, next) => {
  next(new ExpressError("ページが見つかりませんでした", 404));
});

// カスタムエラーハンドリングを設定して、次の処理に渡すミドルウェア
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) {
    err.message = "何か問題が起きました。"; // エラーメッセージがない場合のテキスト
  }
  res.status(statusCode).render("error", { err });
});

// サーバー立ち上げ
app.listen(3000, () => {
  console.log("ポート3000でリクスト待機中...");
});
