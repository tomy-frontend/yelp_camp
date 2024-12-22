// asyncなルーティングに対する、try/catchを自動的にしてくれる関数の定義
// ①asyncな関数を受け取る
// ②返す関数はpromiseを返すのでcatchが使用可能、問題が起きれば自動的にnextが呼ばれて、eを渡すことができる
module.exports = (func) => {
  return (req, res, next) => {
    func(req, res, next).catch((e) => next(e));
  };
};
