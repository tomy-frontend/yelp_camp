const express = require("express");
const router = express.Router(); // mergeParamsで明示的に宣言する必要がある。親からIDが渡ってくるようになる
const passport = require("passport");
const users = require("../controllers/users");

// GET /register 登録ページのルート
router.get("/register", users.renderRegister);

// POST /register 登録フォームのリクエスト先
router.post("/register", users.register);

// loginルート
router.get("/login", users.renderLogin);

// POST /login ログインフォームのリクエスト先
// passportのミドルウェアを差し込んで、optionを設定するだけで認証プロセスを実行してくれる
router.post(
  "/login",
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
router.get("/logout", users.logout);

module.exports = router;
