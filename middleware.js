// ログイン状態をチェックするミドルウェア
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // もともとリクエストした場所を保存しておく
    // req.pathは、/new , req.originalUrlは、 /campgrounds/new の完全なパスがくる
    req.session.returnTo = req.originalUrl;
    req.flash("error", "ログインしてください。");
    return res.redirect("/login");
  }
  next();
};
