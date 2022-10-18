const express = require("express");
const { ObjectId } = require("mongodb");
const todoRouter = express.Router();
const { db } = require("../db");

todoRouter.get("/", async (req, res) => {
  try {
    const { level, enddate } = req.headers;
    let todo;
    if (level) {
      todo = await db.todos
        .find({
          level: level,
        })
        .toArray();
    } else if (enddate) {
      console.log("date", enddate);
      todo = await db.todos.dates
        .find({
          enddate: { $type: "date" },
        })
        .pretty();
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

module.exports = todoRouter;
