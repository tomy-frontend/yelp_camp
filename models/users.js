const mongoose = require("mongoose");
const { Schema } = mongoose;
const passportLocalMongoose = require("passport-local-mongoose");

// ※ この時点でusername,passwordは定義しない
// passport-local-mongooseプラグインを使用すると、Schemaに自動的に以下のフィールドが追加される。
// 以下は明示的に書く必要がない（自動追加される）
// {
//   username: String,    // ユーザー名
//   hash: String,       // ハッシュ化されたパスワード
//   salt: String        // パスワードのソルト
// }

const userSchema = new Schema({
  // emailはpassport-local-mongooseの対象外で、emailは認証には直接使用されないため、自動生成されないため明示的に書く
  // パスワードリセット機能の実装、ユーザーへの通知メール送信...etc
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

// ここでpassportLocalMongooseのプラグインを使用、optionでメッセージの文言をカスタマイズすることが可能。
userSchema.plugin(passportLocalMongoose, {
  errorMessages: {
    MissingPasswordError: "パスワードが入力されていません",
    AttemptTooSoonError:
      "アカウントは現在ロックされています。しばらく時間をおいて再試行してください",
    TooManyAttemptsError:
      "ログイン試行回数が多すぎるため、アカウントがロックされました",
    NoSaltValueStoredError: "認証できません。ソルト値が保存されていません",
    IncorrectPasswordError: "パスワードまたはユーザー名が正しくありません",
    IncorrectUsernameError: "パスワードまたはユーザー名が正しくありません",
    MissingUsernameError: "ユーザー名が入力されていません",
    UserExistsError: "このユーザー名は既に使用されています",
  },
});

module.exports = mongoose.model("User", userSchema);
