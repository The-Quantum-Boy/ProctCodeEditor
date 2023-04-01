const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "../config.env" });

const DB = process.env.MONGOURI;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true,
    // useFindAndModify: false
  })
  .then(() => {
    console.log("connection successfull");
  })
  .catch((err) => console.log(err));
