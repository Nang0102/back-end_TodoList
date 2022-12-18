const express = require("express");
const userRouter = express.Router();
const { ObjectId, Logger } = require("mongodb");
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
  "body ", req.body;

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
          resolve({
            username: username,
            password: hash,
            role: role,
            email: email,
          });
        });
      } else {
        reject({ statusCode: 409, message: "Email is already in use" });
      }
    } catch (error) {
      reject({
        statusCode: 500,
        message: " Some thing went wrong!",
      });
    }
  });
};
userRouter.post("/login", async (req, res) => {
  const { email, password, fromWeb } = req.body;
  console.log("req.body", req.body);
  if (!email || !password || !fromWeb) {
    res.status(401).json({
      message: "Login failed",
    });
  }
  try {
    let userData = await handleUserLogin(email, password, fromWeb);
    console.log("userdata", userData);
    res.status(200).json(userData);
  } catch (error) {
    res.status(error.statusCode).json({ message: error.message });
  }
});

let handleUserLogin = async (email, password, fromWeb) => {
  try {
    let user = await checkUserEmail(email);
    if (user) {
      let check = await bcrypt.compareSync(password, user.password);
      console.log("check", check);
      if (check) {
        const token = jwt.sign(user, jwtKey);
        // const groups = await db.groups.find({}).toArray()
        // for(let i=0; i<groups.length; i++){

        // }
        const userRole = user.role;
        if (userRole == "admin") {
          return {
            token: token,
            username: user.username,
            userId: user._id,
            role: user.role,
            email: user.email,
          };
        } else if (userRole == "user" && fromWeb == "false") {
          return {
            token: token,
            username: user.username,
            userId: user._id,
            role: user.role,
            email: user.email,
          };
        } else {
          return {
            statusCode: 500,
            message: "Some thing went wrong.",
          };
        }
      } else {
        return {
          statusCode: 500,
          message: "Some thing went wrong.",
        };
      }
    }
  } catch (e) {
    return {
      statusCode: 500,
      message: " Error",
    };
  }
};

let checkUserEmail = async (userEmail) => {
  try {
    let user = await db.users.findOne({ email: userEmail });
    if (user) {
      console.log("users", user);
      return user;
    } else {
      return { statusCode: 401, message: "Email is not existed!" };
    }
  } catch (error) {
    return { statusCode: 401, message: "Email is not existed!" };
  }
};

//post

userRouter.post("/", async (req, res) => {
  const { username, avatar, email, role } = req.body;

  try {
    if (role === "admin") {
      const respond = await db.users.insertOne({
        username,
        avatar,
        email,
        role,
      });
      res.status(200).json(respond);
    } else {
      res.json("Not authentication!");
    }
  } catch (error) {
    res.json(error);
  }
});

// get the

userRouter.get("/", async (req, res) => {
  const { username, avatar, email, groupid } = req.body;
  console.log("rew", req.body);
  const query = {};
  if (username) {
    query["username"] = username;
  }
  if (avatar) {
    query["avatar"] = avatar;
  }
  if (email) {
    query["email"] = email;
  }
  if (groupid) {
    // query["groupid"] = groupid;
    const group = await db.users
      .aggregate([
        {
          $lookup: {
            from: "Group",
            localField: "groupid",
            foreignField: "_id",
            as: "groups",
          },
        },
      ])
      .toArray();
    console.log("group1", group.length);
    console.log("group", group[2].groups[0].name);
    let Nhom = [];
    console.log("group1", group.length);
    let groupSize = group.length;
    for (let i = 0; i++; i < groupSize) {
      console.log("gr", group[i].username);
      Nhom.push(group[i].groups);
      console.log("groups", Nhom);
      let NameGroup = [];
      for (let j = 0; j++; j < Nhom.length) {
        NameGroup.push(Nhom[j].name);
        console.log("name", NameGroup);
        return NameGroup;
      }
    }
    return res.json(group);
  }
  // const _id = new Object(id)

  const result = await db.users.find(query).project({ password: 0 }).toArray();

  if (!result) {
    res.json({
      status: "FAILED",
      message: "Không có dữ liệu",
    });
  } else {
    console.log("result", result);
    res.json(result);
  }
});

//get the
userRouter.get("/login/:id", async (req, res) => {
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
  // console.log("body", req.body);
  const filter = {
    _id: new ObjectId(id),
  };
  const updateDoc = {
    $set: body,
  };
  console.log("updateDoc", updateDoc);

  const result = await db.users.updateOne(filter, updateDoc, { upsert: true });

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
    // Idchu: id,
    _id: ObjectId(id),
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
