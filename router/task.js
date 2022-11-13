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
      console.log("userId", userId);
      console.log("querrry", query);
      const userTasks = await db.todos.find(query).toArray();

      console.log("userTask", userTasks);
      const allGroups = await db.groups.find({}).toArray();
      console.log("group", allGroups);
      groups = [];
      list_task = [];
      for (let k = 0; k < allGroups.length; k++) {
        console.log("gr", allGroups[k].admindUserId);
        if (userId == allGroups[k].admindUserId) {
          groups.push(allGroups[k]);
        }
        console.log("groups1", groups);
        let list_user_id;
        for (let n = 0; n < groups.length; n++) {
          list_user_id = groups[n].listUserId;
          console.log("list_user_id", list_user_id);

          for (let m = 0; m < list_user_id.length; m++) {
            list_task.push(
              await db.todos
                .find({
                  userId: list_user_id[m],
                })
                .toArray()
            );
            console.log("list_task", list_task);
          }

          // console.log("user_id", userId);
        }
      }
      let isAdmin = groups.length != 0;
      if (isAdmin) {
        return res.status(200).json(list_task);
      } else {
        console.log("task", userTasks);

        let listItems = await db.items.find({}).toArray();

        for (a = 0; a < userTasks.length; a++) {
          let taskId = userTasks[a]._id.toString();
          // console.log("listItems", listItems);
          let list_item = [];
          for (b = 0; b < listItems.length; b++) {
            // console.log("listItems[b].taskid", listItems[b].taskid);
            // console.log("userTask[a]._id", taskId);

            if (listItems[b].taskid == taskId) {
              list_item.push(listItems[b]);
            }
          }
          userTasks[a].list_item = list_item;
        }
        console.log("todo:", userTasks);
        return res.status(200).json(userTasks);
      }
    }
    console.log("query", query);

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
    console.log("tos", todos);
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
      icontype
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
  icontype
) => {
  try {
    let isUserId = userId;
    await db.todos.findOne({ userId: userId });

    console.log("userId", isUserId);
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
      console.log("task id: ", taskId);
      const list_item = [];

      if (taskId && listItems) {
        for (let q = 0; q < listItems.length; q++) {
          listItems[q].taskid = taskId;
          list_item.push(listItems[q]);
          console.log("list_item ", list_item);
        }
        const resultItem = await db.items.insertMany(list_item);
        console.log("resultitem", resultItem);
        // return itemsWithTaskId
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
      console.log("tas", task);
      const item = { list_item };
      console.log("it", item);

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
