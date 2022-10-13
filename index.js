const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const { connectToDb, db } = require("./db");
const userRouter = require("./router/user");
const port = process.env.PORT || 5000;

app.use(bodyParser.json({ extended: true }));

app.get("/", (req, res) => {
  res.send("hello!");
});

app.use("/user", userRouter);

app.listen(port, () => {
  console.log(`App is on port ${port}`);
  connectToDb();
});
