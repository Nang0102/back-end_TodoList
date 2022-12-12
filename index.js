const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const { connectToDb, db } = require("./db");
const userRouter = require("./router/user");
const uploadRouter = require("./router/upload");
const todoRouter = require("./router/task");
const TaskRouter = require("./router/TaskRouter");
const TaiKhoanRouter = require("./router/TaiKhoanRouter");

let itemRouter = require("./router/item");
const port = process.env.PORT || 5000;
const cors = require("cors");

app.use(cors());

app.use(bodyParser.json({ extended: true }));

app.get("/", (req, res) => {
    res.send("hello!");
});
app.use("/upload", express.static("uploads"));
app.use("/user", userRouter, uploadRouter);
app.use("/todo", todoRouter);
app.use("/item", itemRouter);
app.use("/Task", TaskRouter);
app.use("/TaiKhoan", TaiKhoanRouter);

app.post('/Login', async(req, res) => {
    console.log(req.body)
    const respond = await db.User.findOne(req.body)
    res.status(200)
    res.json(respond)
})

app.listen(port, () => {
    console.log(`App is on port ${port}`);
    connectToDb();
});