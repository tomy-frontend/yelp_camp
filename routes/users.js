const express = require("express");
const router = express.Router(); // mergeParamsで明示的に宣言する必要がある。親からIDが渡ってくるようになる
const User = require("../models/users");
const passport = require("passport");

// GET /register 登録ページのルート
router.get("/register", (req, res) => {
  res.render("users/register");
});

// POST /register 登録フォームのリクエスト先
router.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const user = await new User({ email, username });

    // register()の裏で起こっていること: パスワードのソルト生成,パスワードのハッシュ化,ユーザー情報の保存,重複チェック
    const registeredUser = await User.register(user, password);
    console.log(registeredUser); // 生成データの確認用
    req.flash("success", "yelp-campへようこそ！");
    res.redirect("/campgrounds");
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/register");
  }
});

// loginルート
// GET /login ログインページのルート
router.get("/login", (req, res) => {
  res.render("users/login");
});

// POST /login ログインフォームのリクエスト先
// passportのミドルウェアを差し込んで、optionを設定するだけで認証プロセスを実行してくれる
router.post(
  "/login",
  // authenticate()の裏で起こっていること:ユーザー検索,パスワード検証,セッション管理,エラーハンドリング
  passport.authenticate("local", {
    failureFlash: true, // 失敗時のフラッシュメッセージを有効化
    failureRedirect: "/login", // 失敗時のリダイレクト先
  }),
  (req, res) => {
    req.flash("success", "おかえりなさい！");
    res.redirect("/campgrounds");
  }
);

module.exports = router;
