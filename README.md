# yelp_camp

### 実行コマンド

// MongoDB サービスの起動
brew services start mongodb-community

// MongoDB シェルの起動
mongosh

// MongoDB シェルの終了
exit

// データベース一覧表示
show dbs

// きれいに整形して表示(コレクション名は、作成したモデルの複数形小文字)
db.コレクション名.find()
例)db.products.find()

// MongoDB サービスの停止
brew services stop mongodb-community

// 実行
node product.js
