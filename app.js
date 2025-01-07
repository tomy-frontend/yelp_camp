if (process.env.NODE_ENV !== "production") {
  // Node.jsがもし本番用じゃない時はこの設定で動かす。
  require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/review");
const userRoutes = require("./routes/users");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/users");

// mongooseへの接続
mongoose
  .connect("mongodb://localhost:27017/yelp-camp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
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
app.use(express.static(path.join(__dirname, "public")));

// sessionの設定
const sessionConfig = {
  secret: "mysecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true, // JavaScriptからはcookieにアクセスできない
    // secure: true, // httpsのみを許可する。開発時はhttpだが、本番はhttpsなので最終的にtrueにする
    // cookieの有効期限の設定(ミリ秒で指定)
    maxAge: 1000 * 60 * 60 * 24 * 7, // なんの数字かわかるように意図的に計算式にする。(1週間の有効期限)
  },
};

app.use(session(sessionConfig)); // sessionを使用する

// passportのセットアップ
app.use(passport.initialize()); // passportを使用するためのセットアップ
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); // sessionの中にどうやってUser情報を埋め込みますか？
passport.deserializeUser(User.deserializeUser());

// flashの使用
app.use(flash());

app.use((req, res, next) => {
  res.locals.currentUser = req.user; // localsのcurrentUserにreq.userを渡す
  // res.localsに保存することで、そのリクエスト/レスポンスのサイクル中でテンプレート内のどこからでもアクセスできる
  res.locals.success = req.flash("success"); // 成功した時のflash
  res.locals.error = req.flash("error"); // エラーの時のflash
  next();
});

// 特定ルートへのミドルウェア作成(個別詳細ページ限定のミドルウェア)
app.use("/campgrounds/:id", (req, res, next) => {
  console.log(`ID: ${req.params.id}ページへのアクセス`);
  return next();
});

app.get("/", (req, res) => {
  res.render("HOME");
});

// user,loginルート
app.use("/", userRoutes);

// 別ファイルで定義したRouteを使用する
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.all("*", (req, res, next) => {
  next(new ExpressError("ページが見つかりませんでした", 404));
});

// カスタムエラーハンドリングを設定して、次の処理に渡すミドルウェア
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) {
    err.message = "何か問題が起きました。"; // エラーメッセージがない場合の汎用的なテキスト
  }
  res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
  console.log("ポート3000でリクスト待機中...");
});
