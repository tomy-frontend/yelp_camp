// エラーハンドリング用のクラスを自作する
class AppError extends Error {
  constructor(message, status) {
    super();
    this.message = message;
    this.status = status;
    this.timestamp = new Date(); // タイムスタンプを追加
    Error.captureStackTrace(this, this.constructor); // スタックトレースの取得
  }
}

module.exports = AppError;
