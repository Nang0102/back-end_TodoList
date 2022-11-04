const express = require("express");
const { ObjectId } = require("mongodb");
const itemRouter = express.Router();
const { db } = require("../db");

//get item
itemRouter.get("/", async (req, res) => {
  const items = await db.items.find({}).toArray();
  res.status(200).json(items);
});

//create item
itemRouter.post("/", async (req, res) => {
  const { isComplete, titleItem, descriptionItem, taskid } = req.body;
  console.log("check", req.body);

  if (!isComplete || !titleItem || !descriptionItem || !taskid) {
    res.status(500).json("Item creation failed: ");
  }
  try {
    let itemData = await handleItem(
      isComplete,
      titleItem,
      descriptionItem,
      taskid
    );
    console.log("itemData", itemData);
    res.status(200).json(itemData);
  } catch (error) {
    res.status(error.statusCode).json({ message: error.message });
  }
});

let handleItem = async (isComplete, titleItem, descriptionItem, taskid) => {
  try {
    let isTaskId = taskid;
    await db.items.findOne({ taskid: taskid });
    console.log("taskid", taskid);

    console.log("istaskid", isTaskId);
    if (isTaskId) {
      let list_item = await db.items.insertOne({
        isComplete,
        titleItem,
        descriptionItem,
        taskid,
      });
      return list_item;
    }
  } catch (error) {
    error;
  }
};
// update item
itemRouter.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body;
    const filter = {
      _id: new ObjectId(id),
    };
    const updateDoc = {
      $set: body,
    };
    const item = await db.items.updateOne(filter, updateDoc);
    res.status(201);
    res.json(item);
  } catch (error) {
    res.status(500);
    res.json("Some thing went wrong" + error);
  }
});

module.exports = itemRouter;
