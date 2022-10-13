const express = require("express");
const userRouter = express.Router();
const { ObjectId } = require("mongodb");
const { db } = require("../db");
// here we create our Route
userRouter.post("/", async (req, res) => {
  const User = ({ username, password, role, email } = req.body);
  const result = await db.users.insertOne(User);

  if (!result) {
    res.json({
      status: "FAILED",
      message: "Không thêm được tài khoản",
    });
  } else {
    res.json({
      status: "SUCCESS",
      message: "Thêm tài khoản thành công",
      data: User,
    });
  }
});
// get the

userRouter.get("/", async (req, res) => {
  const result = await db.users.find({}).toArray();

  if (!result) {
    res.json({
      status: "FAILED",
      message: "Không có dữ liệu",
    });
  } else {
    res.json({
      status: "SUCCESS",
      message: "Lấy được dữ liệu",
      data: result,
    });
  }
});

//get the
userRouter.get("/:id", async (req, res) => {
  const id = req.params.id;
  const result = await db.users
    .find({
      _id: ObjectId(id),
    })
    .toArray();

  if (!result) {
    res.json({
      status: "FAILED",
      message: "Không có dữ liệu",
    });
  } else {
    res.json({
      status: "SUCCESS",
      message: "Lấy được dữ liệu",
      data: result,
    });
  }
});

//get the
userRouter.put("/:id", async (req, res) => {
  const id = req.params.id;
  const body = req.body;
  const filter = {
    _id: new ObjectId(id),
  };
  const updateDoc = {
    $set: body,
  };
  const result = await db.users.updateOne(filter, updateDoc);

  if (!result) {
    res.json({
      status: "FAILED",
      message: "Không có dữ liệu",
    });
  } else {
    res.json({
      status: "SUCCESS",
      message: "Lấy được dữ liệu",
      data: result,
    });
  }
});

userRouter.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const body = req.body;
  const filter = {
    Idchu: id,
  };
  const updateDoc = {
    $set: body,
  };
  const result = await db.users.deleteOne(filter);

  if (!result) {
    res.json({
      status: "FAILED",
      message: "Không có dữ liệu",
    });
  } else {
    res.json({
      status: "SUCCESS",
      message: "Lấy được dữ liệu",
      data: result,
    });
  }
});

module.exports = userRouter;
