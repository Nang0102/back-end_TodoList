const express = require("express");
const { ObjectId } = require("mongodb");
const { db } = require("../db");
const todoRouter = express.Router();

todoRouter.get("/", async (req, res) => {
  try {
    const {
      id,
      level,
      // enddate,
      startdate,
      title,
      type,
      icontype,
      // listItem,
    } = req.headers;
    const userId = req.headers.userid;
    const { fromDate, toDate, fromEndDate, toEndDate } = req.body;
    // const userId = req.body.userId;
    console.log("reqbody: ", req.body);
    let todos;
    // if (level) {
    //   todo = await db.todos
    //     .find({
    //       level: level,
    //     })
    //     .toArray();
    // } else if (enddate) {
    //   console.log("date", enddate);
    //   todo = await db.todos
    //     .find({
    //       enddate: new Date(enddate),
    //     })
    //     .toArray();
    // } else if (startdate) {
    //   todo = await db.todos
    //     .find({
    //       startdate: new Date(startdate),
    //     })
    //     .toArray();
    // } else if (id) {
    //   todo = await db.todos.findOne({
    //     _id: new ObjectId(id),
    //   });
    // } else if (title) {
    //   todo = await db.todos.findOne({
    //     title: title,
    //   });
    // } else if (userId) {
    //   todo = await db.todos.findOne({
    //     userId: userId,
    //   });
    //   console.log("todoUserId", todo);
    // } else if (type) {
    //   todo = await db.todos.findOne({
    //     type: type,
    //   });
    //   console.log("type", type);
    // } else if (icontype) {
    //   todo = await db.todos.findOne({
    //     icontype: icontype,
    //   });
    // } else {
    //   // todo = await db.items.find({}).toArray();
    //   todo = await db.todos.find({}).toArray();
    //   console.log("todoAr", todo);
    // }
    const query = {};
    if (level) {
      query["level"] = level;
    }
    if (fromDate && toDate) {
      query["startdate"] = {
        $gte: new Date(req.body.fromDate).toISOString(),
        $lte: new Date(req.body.toDate).toISOString(),
      };
    }
    if (fromEndDate && toEndDate) {
      query["enddate"] = {
        $gte: new Date(req.body.fromEndDate).toISOString(),
        $lte: new Date(req.body.toEndDate).toISOString(),
      };
    }

    // console.log("bod:", req.body.fromDate);
    // console.log(typeof req.body.fromDate);
    // console.log("date", typeof new Date(req.body.toDate).toISOString());

    if (type) {
      query["type"] = type;
    }
    if (title) {
      query["title"] = title;
    }
    if (id) {
      query["_id"] = new ObjectId(id);
    }
    if (icontype) {
      query["icontype"] = icontype;
    }
    if (userId) {
      query["userId"] = userId;
    }

    console.log("query: ", query);

    todos = await db.todos.find(query).toArray();
    items = await db.items.find({}).toArray();

    for (let i = 0; i < todos.length; i++) {
      listItem = [];
      todoId = todos[i]._id.toString();

      for (let j = 0; j < items.length; j++) {
        itemId = items[j].taskid;

        if (todoId == itemId) {
          listItem.push(items[j]);
        }
      }
      todos[i].list_item = listItem;
    }
    console.log("todos", todos);
    res.status(200);
    res.json(todos);
    // res.json(items);
  } catch (error) {
    res.status(500);
    res.json("some thing went wrong " + error);
  }
});
todoRouter.get("/");

// create task
todoRouter.post("/", async (req, res) => {
  const {
    complete,
    description,
    enddate,
    startdate,
    level,
    title,
    userId,
    type,
    icontype,
    list_item,
  } = req.body;
  console.log("req:", req.body);

  if (
    !complete ||
    !description ||
    !enddate ||
    !startdate ||
    !level ||
    !title ||
    !userId ||
    !type ||
    !icontype
  ) {
    res.status(500).json("Task creation failed: ");
  }

  try {
    let todoData = await handleTodo(
      complete,
      description,
      enddate,
      startdate,
      level,
      title,
      userId,
      type,
      icontype,
      list_item
      // req.body
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
  startdate,
  level,
  title,
  userId,
  type,
  icontype,
  list_item
  // body
) => {
  try {
    let isUserId = userId;
    await db.todos.findOne({ userId: userId });

    console.log("userId", isUserId);

    // let items = await db.items.find({}).toArray();
    // console.log("item", items);
    if (isUserId) {
      const respond = await db.todos.insertOne({
        complete,
        description,
        enddate,
        startdate,
        level,
        title,
        userId,
        type,
        icontype,
        list_item,
      });

      return respond;
    }
  } catch (error) {
    error;
  }
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
    res.status(500).json("Some thing went wrong!" + error);
  }
});

//statistic
todoRouter.get("/statistic", async (req, res) => {
  try {
    console.log("req.body: ", req.headers);
    const userId = req.headers.userid;

    let percent = 0;

    if (userId) {
      const tasks = await db.todos
        .find({
          userId: userId,
        })
        .toArray();

      const listTasks = [];
      for (let i = 0; i < tasks.length; i++) {
        // console.log("enddateTask: ", tasks[i].enddate);
        let endDate = tasks[i].enddate;

        endDate = new Date(endDate);
        Year = endDate.getFullYear();
        Month = endDate.getMonth() + 1;

        console.log("month", Month);

        const monthReq = req.body.month;
        console.log("monthReq", monthReq);

        const yearReq = req.body.year;

        if (Year == yearReq && Month == monthReq) {
          listTasks.push(tasks[i]);
        }
        console.log("ListTask: ", listTasks);
      }

      const totalTasks = listTasks.length;

      console.log("totalTask: ", totalTasks);

      const listDoneTasks = [];
      for (let i = 0; i < listTasks.length; i++) {
        let completeTask = listTasks[i].complete;
        if (completeTask === "Yes") {
          listDoneTasks.push(completeTask);
        }
      }
      console.log("listDoneTasks: ", listDoneTasks);

      const totalListDoneTask = listDoneTasks.length;
      console.log("totalListDoneTask: ", totalListDoneTask);

      percent = (totalListDoneTask / totalTasks) * 100;
    }

    res.status(200).json({ " Successful": percent });
  } catch (error) {
    res.status(500).json("Some thing went wrong: " + error);
  }
});

module.exports = todoRouter;
