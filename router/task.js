const express = require("express");
const { ObjectId } = require("mongodb");
const todoRouter = express.Router();
const { db } = require("../db");

todoRouter.get("/", async (req, res) => {
  try {
    const { id, level, enddate, startday, title, type, icontype, userId } =
      req.headers;
    let todo;
    if (level) {
      todo = await db.todos
        .find({
          level: level,
        })
        .toArray();
    } else if (enddate) {
      console.log("date", enddate);
      todo = await db.todos
        .find({
          enddate: new Date(enddate),
        })
        .toArray();
    } else if (startday) {
      todo = await db.todos
        .find({
          startday: new Date(startday),
        })
        .toArray();
    } else if (id) {
      todo = await db.todos.findOne({
        _id: new ObjectId(id),
      });
    } else if (title) {
      todo = await db.todos.findOne({
        title: title,
      });
    } else if (userId) {
      todo = await db.todos.findOne({
        userId: userId,
      });
    } else if (type) {
      todo = await db.todos.findOne({
        type: type,
      });
    } else if (icontype) {
      todo = await db.todos.findOne({
        icontype: icontype,
      });
    } else {
      todo = await db.items.find({}).toArray();
      // todo = await db.todos.find({}).toArray();
    }
    res.status(200);
    res.json(todo);
  } catch (error) {
    res.status(500);
    res.json("some thing went wrong " + error);
  }
});

// create task
todoRouter.post("/", async (req, res) => {
  const {
    complete,
    description,
    enddate,
    startday,
    level,
    title,
    userId,
    type,
    icontype,
    itemId,
  } = req.body;

  if (
    !complete ||
    !description ||
    !enddate ||
    !startday ||
    !level ||
    !title ||
    !userId ||
    !type ||
    !icontype ||
    !itemId
  ) {
    res.status(500).json("Task creation failed: " + error);
  }

  try {
    let todoData = await handleTodo(
      complete,
      description,
      enddate,
      startday,
      level,
      title,
      userId,
      type,
      icontype,
      itemId
    );
    console.log("todoData", todoData);
    res.status(200).json(todoData);
  } catch (error) {
    res.status(error.statusCode).json({ message: error.message });
  }
});

let handleTodo = async (
  complete,
  description,
  enddate,
  startday,
  level,
  title,
  userId,
  type,
  icontype,
  itemId
) => {
  return new Promise(async (resolve, reject) => {
    try {
      let isUserId = await checkUserId(userId);

      if (isUserId) {
        const respond = await db.todos.insertOne({
          complete,
          description,
          enddate,
          startday,
          level,
          title,
          userId,
          type,
          icontype,
          itemId,
        });
        resolve(respond);
      } else {
        reject({ statusCode: 500, message: "User is not exsit!" });
      }
    } catch (error) {
      reject({
        statusCode: 500,
        message: " Error: " + error,
      });
    }
  });
};

let checkUserId = (userIdreq) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.todos.findOne({ userId: userIdreq });
      if (user) {
        resolve(user);
      } else {
        resolve(false);
      }
    } catch (error) {
      reject(error);
    }
  });
};

//update task
todoRouter.put("", async (req, res) => {
  try {
    const id = req.headers.id;

    const body = req.body;

    const filter = {
      _id: new ObjectId(id),
    };
    const updateDoc = {
      $set: body,
    };
    const todo = await db.todos.updateOne(filter, updateDoc);
    res.status(200).json(todo);
  } catch (error) {
    res.status(500).json("Some thing went wrong!" + error);
  }
});

//statistic
todoRouter.get("/statistic", async (req, res) => {
  try {
    console.log("req.headers: ", req.headers);
    const userId = req.headers.userid;

    if (userId) {
      const checkUserId = await db.todos
        .find({
          userId: userId,
        })
        .toArray();
      // const result = checkUserId.length;
      // console.log(result);
      console.log("checkUserId: ", checkUserId);
      const enddate = req.headers.enddate;
      // console.log("req", req.headers);
      // console.log("end", enddate1);
      const checkMonth = await db.todos
        .find({
          enddate: new Date(checkUserId.enddate),
        })
        .toArray();
      // let month = checkMonth.getMonth();
      // console.log("month", month);
      console.log("Date", checkUserId.enddate);
      console.log("Date2", new Date(checkUserId.enddate));
      console.log("End2", enddate);
      console.log("month", checkMonth);
    }

    res.status(200).json("Successful!");
  } catch (error) {
    res.status(500).json("Some thing went wrong: " + error);
  }
});

module.exports = todoRouter;
