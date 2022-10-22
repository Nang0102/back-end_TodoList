const express = require("express");
const { ObjectId } = require("mongodb");
const todoRouter = express.Router();
const { db } = require("../db");

todoRouter.get("/", async (req, res) => {
  try {
    const { id, level, enddate, startday } = req.headers;
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
    } else {
      todo = await db.todos.find({}).toArray();
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
    process,
    title,
    userId,
  } = req.body;

  if (
    !complete ||
    !description ||
    !enddate ||
    !startday ||
    !level ||
    !process ||
    !title ||
    !userId
  ) {
    res.status(500).json("Task creation failed");
  }

  try {
    let todoData = await handleTodo(
      complete,
      description,
      enddate,
      startday,
      level,
      process,
      title,
      userId
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
  process,
  title,
  userId
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
          process,
          title,
          userId,
        });
        resolve(respond);
      } else {
        reject({ statusCode: 500, message: "User is not exsit!" });
      }
    } catch (error) {
      reject({
        statusCode: 500,
        message: " Error",
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
todoRouter.put("/", async (req, res) => {
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
    res.status(500).json("Some thing went wrong!");
  }
});

module.exports = todoRouter;
