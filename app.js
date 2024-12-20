const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const Campground = require("./models/campground");
const campground = require("./models/campground");
const morgan = require("morgan"); // ログ記録Morgan

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

// app.useは全てのリクエストの中身で呼ばれる
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
// app.use(morgan("dev")); // Morganを全てのリクエスト

// // 自作したミドルウェア①
// app.use((req, res, next) => {
//   console.log("自作したミドルウェア!!!");
//   return next(); // nextを呼ばないと処理が止まってレスポンスまで行かない！
// });

// // 自作したミドルウェア②
// app.use((req, res, next) => {
//   console.log("2個目のミドルウェア!!!");
//   return next();
// });

// 特定ルートへのミドルウェア
app.use("/campgrounds/:id", (req, res, next) => {
  console.log(`ID: ${req.params.id}ページへのアクセス`);
  return next();
});

// 簡易パスワード認証ミドルウェア(!本番では絶対やっちゃだめ!)
// 関数にすることで、特定のルーティングで使用することができる
const verifyPassword = (req, res, next) => {
  const { password } = req.query;
  if (password === "supersecret") {
    return next();
  }
  res.send("パスワードが必要です。");
};

// ホームディレクトリのルーティング
app.get("/", (req, res) => {
  res.render("home");
});

// campgroundルーティング(indexページ)
app.get("/campgrounds", async (req, res) => {
  const campgrounds = await campground.find({});
  res.render("campgrounds/index", { campgrounds });
});

// 新規追加ページのルーティング(ルーティングの場所に注意！)
app.get("/campgrounds/new", async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  res.render("campgrounds/new");
});

// 新規登録フォームの送信先のルーティング
app.post("/campgrounds", async (req, res) => {
  const campground = new Campground(req.body.campground);
  await campground.save();
  res.redirect(`/campgrounds/${campground.id}`);
});

// 詳細ページへのルーティング
app.get("/campgrounds/:id", async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  res.render("campgrounds/show", { campground });
});

// 編集ページのルーティング
app.get("/campgrounds/:id/edit", async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  res.render("campgrounds/edit", { campground });
});

// 編集処理完了後のルーティング
app.put("/campgrounds/:id", async (req, res) => {
  const { id } = req.params;
  // 分割代入でそれぞれに値が入る
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  res.redirect(`/campgrounds/${campground._id}`);
});

// 削除ルーティング
app.delete("/campgrounds/:id", async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  res.redirect("/campgrounds"); // 一覧ページにリダイレクト
});

// 認証ページ
// 第二引数に作成したミドルウェアを設定して、特定のルーティングにだけミドルウェアを設定することができる
app.get("/secret", verifyPassword, (req, res) => {
  res.send("ここは秘密のページ!!突破おめでとう！");
});

// ルーティングの最後に上記どれにも一致しないルートは404ページとして返す。次はないからnext()も必要ない。
// 記述する場所はルーティング記載の1番最後！！
app.use((req, res) => {
  res.status(404).send("ページが見つかりません。");
});

// サーバー立ち上げ
app.listen(3000, () => {
  console.log("ポート3000でリクスト待機中...");
});
