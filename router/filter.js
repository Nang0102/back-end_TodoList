const express = require("express");
const { db } = require("../db");
const filterRouter = express.Router();

filterRouter.get("./", async (req, res) => {
  const userFilter = await db.todos.find({
    email,
    username,
    role,
    DateOfBirth,
    profession,
    avatar,
  });
});

module.exports = filterRouter;
