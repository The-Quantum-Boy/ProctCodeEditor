const dotenv = require("dotenv");
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");

const cookieParser = require("cookie-parser");
const myParser = require("body-parser");
const app = express();

dotenv.config({ path: "./config.env" });
require("./db/conn");

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  next();
});

app.use(cookieParser());
app.use(myParser.json({ limit: "200mb" }));
app.use(myParser.urlencoded({ limit: "200mb", extended: true }));
app.use(myParser.text({ limit: "200mb" }));

app.use(require("./routes/user"));

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`server is running at port no ${PORT}`);
});
