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
const Joi = require("joi");

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

// 特定ルートへのミドルウェア作成
app.use("/campgrounds/:id", (req, res, next) => {
  console.log(`ID: ${req.params.id}ページへのアクセス`);
  return next();
});

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

// 新規登録フォームの送信先のルーティング + Joiでサーバーサイドのバリデーション
app.post(
  "/campgrounds",
  catchAsync(async (req, res) => {
    const campgroundSchema = Joi.object({
      campground: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string().required(),
        location: Joi.string().required(),
        description: Joi.string().required(),
      }).required(),
    });
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
      const msg = error.details.map((detail) => detail.message).join(",");
      throw new ExpressError(msg, 400);
    }
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
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
app.put(
  "/campgrounds/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    // 分割代入でそれぞれに値が入る
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    res.redirect(`/campgrounds/${campground._id}`);
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
    err.message = "何か問題が起きました。";
  }
  res.status(statusCode).render("error", { err });
});

// サーバー立ち上げ
app.listen(3000, () => {
  console.log("ポート3000でリクスト待機中...");
});
