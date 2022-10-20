const express = require("express");
const userRouter = express.Router();
const { ObjectId } = require("mongodb");
const { db } = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtKey = require("./key");

// here we create our Route
userRouter.post("/sign-up", async (req, res) => {
  const { username, password, email, role } = req.body;
  const isEmail =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
      email
    );
  console.log("body ", req.body);

  if (!email || !username || !password) {
    return res.status(500).json({
      errCode: 1,
      message: "Missing input parameters!",
    });
  }
  if (!isEmail) {
    return res.status(500).json({
      errCode: 1,
      message: "Email is invalid",
    });
  }

  try {
    let userData = await handleUserSignup(email, username, password, role);
    res.status(200).json(userData);
  } catch (error) {
    res.status(error.statusCode).json({ message: error.message });
  }
});

let handleUserSignup = async (email, username, password, role) => {
  return new Promise(async (resolve, reject) => {
    try {
      let isExist = await checkUserEmail(email);
      if (!isExist) {
        const saltRounds = 10;
        await bcrypt.hash(password, saltRounds, async function (err, hash) {
          const respond = await db.users.insertOne({
            email,
            username,
            password: hash,
            role,
          });
          delete password;
          resolve(respond);
        });
      } else {
        reject({ statusCode: 409, message: "Email is already in use" });
      }
    } catch (error) {
      reject({
        statusCode: 500,
        message: " Error",
      });
    }
  });
};

userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(401).json({
      message: "Login failed",
    });
  }
  try {
    let userData = await handleUserLogin(email, password);
    console.log("user", userData);
    res.status(200).json(userData);
  } catch (error) {
    res.status(error.statusCode).json({ message: error.message });
  }
});

let handleUserLogin = async (email, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      let isExist = await checkUserEmail(email);
      if (isExist) {
        let user = await db.users.findOne({
          email,
        });

        if (user) {
          let check = await bcrypt.compareSync(password, user.password);
          if (check) {
            const token = jwt.sign(user, jwtKey);
            resolve(token);
          } else {
            reject({ statusCode: 409, message: "Wrong password!" });
          }
        }
      } else {
        reject({ statusCode: 401, message: "Email is not existed!" });
      }
    } catch (e) {
      reject({
        statusCode: 500,
        message: " Error",
      });
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
  const checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
  if (!checkForHexRegExp.test(id)) {
    res.json({
      status: "Failed",
      message: "Key not valid",
    });
    return;
  }
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
