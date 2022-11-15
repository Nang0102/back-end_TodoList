const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const { connectToDb, db } = require("./db");
const userRouter = require("./router/user");
const uploadRouter = require("./router/upload");
const todoRouter = require("./router/task");
let itemRouter = require("./router/item");
const port = process.env.PORT || 5000;

app.use(bodyParser.json({ extended: true }));

app.get("/", (req, res) => {
  res.send("hello!");
});

app.use("/user", userRouter);
app.use("/todo", todoRouter);
app.use("/item", itemRouter);
app.use("/upload", uploadRouter);

app.listen(port, () => {
  console.log(`App is on port ${port}`);
  connectToDb();
});
