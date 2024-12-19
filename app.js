const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const Campground = require("./models/campground");

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

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ホームディレクトリのルーティング
app.get("/", (req, res) => {
  res.render("home");
});

// makecampgroundルーティング
app.get("/makecampground", async (req, res) => {
  const camp = new Campground({
    title: "私の庭",
    description: "気軽にキャンプ",
  });
  await camp.save();
  res.send(camp);
});

// サーバー立ち上げ
app.listen(3000, () => {
  console.log("ポート3000でリクスト待機中...");
});
