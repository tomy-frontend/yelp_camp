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

// 新規追加ページのルーティング(ルーティングの場所に注意！)
app.get(
  "/campgrounds/new",
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/new");
  })
);

// 新規登録フォームの送信先のルーティング
app.post(
  "/campgrounds",
  catchAsync(async (req, res) => {
    // 値がない時のエラーハンドリング
    if (!req.body.campground)
      throw new ExpressError("不正なキャンプ場のエラーです。", 400); // req.body.campgroundがなければエラー
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

// 詳細ページへのルーティング
app.get(
  "/campgrounds/:id",
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/show", { campground });
  })
);

// 編集ページのルーティング
app.get(
  "/campgrounds/:id/edit",
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", { campground });
  })
);

// 編集処理完了後のルーティング
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
  // // CastErrorの場合の特別処理を追加
  // if (err.name === "CastError") {
  //   return res.status(404).send("指定されたIDが無効です");
  // }
  const { status = 500, message = "何かエラーが起きました" } = err;
  res.status(status).send(message);
});

// サーバー立ち上げ
app.listen(3000, () => {
  console.log("ポート3000でリクスト待機中...");
});
