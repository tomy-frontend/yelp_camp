const mongoose = require("mongoose");
const cities = require("./cities");
const Campground = require("../models/campground");
const { descriptors, places } = require("./seedHelpers");

// mongooseへの接続
mongoose
  .connect("mongodb://localhost:27017/yelp-camp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("MongoDB接続完了!");
  })
  .catch((error) => {
    console.log("MongoDB接続エラー!", error);
  });

const sample = (array) => array[Math.floor(Math.random() * array.length)];

// seedsデータの投入
const seedDB = async () => {
  await Campground.deleteMany({}); // 既存のデータを全消し
  for (let i = 0; i < 50; i++) {
    const randomCityIndex = Math.floor(Math.random() * cities.length);
    const price = Math.floor(Math.random() * 2000) + 1000;
    const camp = new Campground({
      location: `${cities[randomCityIndex].prefecture}${cities[randomCityIndex].city}`,
      title: `${sample(descriptors)}・${sample(places)}`,
      image: "https://picsum.photos/800",
      description:
        "これはダミーテキストです。この文章は仮のものです。文字数、文体、内容の確認のためにここに表示されています。これはダミーテキストです。この文章は仮のものです。文字数、文体、内容の確認のためにここに表示されています。",
      price,
    });
    await camp.save();
  }
};

// 実行後、mongooseが閉じる
seedDB().then(() => {
  mongoose.connection.close();
});
