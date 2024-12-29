const User = require("../models/users");

module.exports.renderRegister = (req, res) => {
  res.render("users/register");
};

module.exports.register = async (req, res, next) => {
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
};

module.exports.renderLogin = (req, res) => {
  res.render("users/login");
};

module.exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      // エラーがあった場合の処理
      return next(err);
    }
    req.flash("success", "ログアウトしました！");
    res.redirect("/campgrounds");
  });
};
