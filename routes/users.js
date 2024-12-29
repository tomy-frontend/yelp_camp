const express = require("express");
const router = express.Router(); // mergeParamsで明示的に宣言する必要がある。親からIDが渡ってくるようになる
const passport = require("passport");
const users = require("../controllers/users");

router.route("/register").get(users.renderRegister).post(users.register);

router
  .route("/login")
  .get(users.renderLogin)
  .post(
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
