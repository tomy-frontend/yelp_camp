const express = require("express");
const router = express.Router(); // mergeParamsで明示的に宣言する必要がある。親からIDが渡ってくるようになる
const User = require("../models/users");
const passport = require("passport");

// GET /register 登録ページのルート
router.get("/register", (req, res) => {
  res.render("users/register");
});

// POST /register 登録フォームのリクエスト先
router.post("/register", async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const user = await new User({ email, username });

    // register()の裏で起こっていること: パスワードのソルト生成,パスワードのハッシュ化,ユーザー情報の保存,重複チェック
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "yelp-campへようこそ！");
      res.redirect("/campgrounds");
    });
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
  // 認証前にreturnToを一時保存するミドルウェア
  (req, res, next) => {
    const returnTo = req.session.returnTo;
    req.tempReturnTo = returnTo; // reqオブジェクトに一時保存
    next();
  },
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  (req, res) => {
    req.flash("success", "おかえりなさい！");
    // 一時保存した値を使用
    const redirectUrl = req.tempReturnTo || "/campgrounds";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
  }
);

// ログアウトルート
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      // エラーがあった場合の処理
      return next(err);
    }
    req.flash("success", "ログアウトしました！");
    res.redirect("/campgrounds");
  });
});

module.exports = router;
