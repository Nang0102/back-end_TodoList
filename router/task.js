const express = require("express");
const { ObjectId } = require("mongodb");
const { db } = require("../db");
const todoRouter = express.Router();

todoRouter.get("/", async (req, res) => {
  try {
    const {
      id,
      level,
      title,
      type,
      icontype,
      fromdate,
      todate,
      fromenddate,
      toenddate,
      list_item,
    } = req.headers;
    const userId = req.headers.userid;

    console.log(req.headers);
    // console.log(req.body);
    // const { fromDate, toDate, fromenddate, toenddate } = req.body;
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
    if (fromdate && todate) {
      query["startdate"] = {
        $gte: new Date(req.headers.fromdate).toISOString(),
        $lte: new Date(req.headers.todate).toISOString(),
      };
    }
    if (fromenddate && toenddate) {
      query["enddate"] = {
        $gte: new Date(req.headers.fromenddate).toISOString(),
        $lte: new Date(req.headers.toenddate).toISOString(),
      };
    }
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
      const userTasks = await db.todos.find(query).toArray();
      const allGroups = await db.groups.find({}).toArray();
      groups = [];
      list_task = [];
      for (let k = 0; k < allGroups.length; k++) {
        if (userId == allGroups[k].admindUserId) {
          groups.push(allGroups[k]);
        }
        let list_user_id;
        for (let n = 0; n < groups.length; n++) {
          list_user_id = groups[n].listUserId;

          for (let m = 0; m < list_user_id.length; m++) {
            list_task.push(
              await db.todos
                .find({
                  userId: list_user_id[m],
                })
                .toArray()
            );
          }
        }
      }
      let isAdmin = groups.length != 0;
      if (isAdmin) {
        return res.status(200).json(list_task);
      } else {
        let listItems = await db.items.find({}).toArray();

        for (a = 0; a < userTasks.length; a++) {
          let taskId = userTasks[a]._id.toString();
          let list_item = [];
          for (b = 0; b < listItems.length; b++) {
            if (listItems[b].taskid == taskId) {
              list_item.push(listItems[b]);
            }
          }
          userTasks[a].list_item = list_item;
        }
        return res.status(200).json(userTasks);
      }
    }

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
    return res.status(200).json(todos);

    // res.json(items);
  } catch (error) {
    res.status(500);
    res.json("some thing went wrong " + error);
  }
});

// create task
todoRouter.post("/", async (req, res) => {
  const task = ({
    complete,
    description,
    enddate,
    startdate,
    level,
    title,
    userId,
    type,
    icontype,
    listItems,
  } = req.body);

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
      icontype
    );
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
  icontype
) => {
  try {
    let isUserId = userId;
    await db.todos.findOne({ userId: userId });

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
      });

      const taskId = respond.insertedId.toString();
      const list_item = [];

      if (taskId && listItems) {
        for (let q = 0; q < listItems.length; q++) {
          listItems[q].taskid = taskId;
          // list_item.push((listItems[q].isComplete = "No"));
          list_item.push(listItems[q]);
        }
        const resultItem = await db.items.insertMany(list_item);
      }
      const task = {
        _id: respond.insertedId,
        complete,
        description,
        enddate,
        startdate,
        level,
        title,
        userId,
        type,
        icontype,
      };
      const item = { list_item };

      const result = { ...task, ...item };

      return {
        result,
      };
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

todoRouter.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    let respond;
    if (id) {
      respond = await db.todos.deleteOne({ _id: new ObjectId(id) });
      if (respond.acknowledged) {
        res.json(`Successfully delete ${respond.deletedCount}`);
        return;
      }
      res.json(respond);
      return;
    } else {
      res.status(400).json("Id is missing");
      return;
    }
  } catch (error) {
    res.status(500).json("Some thing went wrong " + error);
  }
});

//statistic
todoRouter.get("/statistic", async (req, res) => {
  try {
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
        let endDate = tasks[i].enddate;

        endDate = new Date(endDate);
        Year = endDate.getFullYear();
        Month = endDate.getMonth() + 1;

        const monthReq = req.body.month;

        const yearReq = req.body.year;

        if (Year == yearReq && Month == monthReq) {
          listTasks.push(tasks[i]);
        }
      }

      const totalTasks = listTasks.length;

      const listDoneTasks = [];
      for (let i = 0; i < listTasks.length; i++) {
        let completeTask = listTasks[i].complete;
        if (completeTask === "Yes") {
          listDoneTasks.push(completeTask);
        }
      }

      const totalListDoneTask = listDoneTasks.length;
      percent = (totalListDoneTask / totalTasks) * 100;
    }

    res.status(200).json({ " Successful": percent });
  } catch (error) {
    res.status(500).json("Some thing went wrong: " + error);
  }
});

module.exports = todoRouter;
