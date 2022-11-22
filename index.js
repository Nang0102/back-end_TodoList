const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const { connectToDb, db } = require("./db");
const userRouter = require("./router/user");
const uploadRouter = require("./router/upload");
const todoRouter = require("./router/task");
let itemRouter = require("./router/item");
const filterRouter = require("./router/filter");
const port = process.env.PORT || 5000;

app.use(bodyParser.json({ extended: true }));

app.get("/", (req, res) => {
  res.send("hello!");
});
app.use("/upload", express.static("uploads"));
app.use("/user", userRouter, uploadRouter);
app.use("/todo", todoRouter);
app.use("/item", itemRouter);
app.use("/text", filterRouter);

app.listen(port, () => {
  console.log(`App is on port ${port}`);
  connectToDb();
});
