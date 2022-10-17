const express = require("express");
const userRouter = express.Router();
const { ObjectId } = require("mongodb");
const { db } = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtKey = require("./key");

// here we create our Route
userRouter.post("/sign-up", async (req, res) => {
  const User = ({ username, role, password, email } = req.body);
  console.log("abc", req.body);
  const saltRounds = 10;
  await bcrypt.hash(password, saltRounds, async function (err, hash) {
    const result = await db.users.insertOne({
      username,
      password: hash,
      role,
      email,
    });
    res.status(201);
    res.json(result);
    if (err) {
      res.status(500);
      res.json(err);
    }
  });
  return;
});

userRouter.post("/login", async (req, res) => {
  const { email, username, password } = req.body;
  if (!email || !username || !password) {
    return res.status(500).json({
      errCode: 1,
      message: "Missing input parameters!",
    });
  }

  let userData = await handleUserLogin(email, username, password);
  return res.json({
    errCode: userData.errCode,
    message: userData.errMessage,
    user: userData.user ? userData.user : {},

    token: userData.token ? userData.token : "",
  });
});

let handleUserLogin = async (email, username, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      let userData = {};
      let isExist = await checkUserEmail(email);
      if (isExist) {
        let user = await db.users.findOne({
          email,
        });
        if (user) {
          let check = await bcrypt.compare(password, user.password);
          if (check && username === user.username) {
            const token = jwt.sign(user, jwtKey);

            userData.errCode = 0;
            userData.errMessage = "ok";

            userData.token = token;

            delete user.password;
            userData.user = user;
          } else {
            userData.errCode = 3;
            userData.errMessage = "Wrong username or password!";
          }
        } else {
          userData.errCode = 2;
          userData.errMessage = "User is not found!";
          resolve();
        }
      } else {
        userData.errCode = 1;
        userData.errMessage = "Email is not existed!";
      }
      resolve(userData);
    } catch (e) {
      reject(e);
    }
  });
};

let checkUserEmail = (userEmail) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.users.findOne({ email: userEmail });
      if (user) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (error) {
      reject(error);
    }
  });
};

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
