const { MongoClient } = require("mongodb");

const url =
  "mongodb+srv://todo:todo123456@cluster0.dqbwvlw.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(url);
const dbName = "User_Management";
const db = {};

async function connectToDb() {
  await client.connect();
  console.log("Connected successfully to Database");
  const database = client.db(dbName);

  db.users = database.collection("User");
  db.todos = database.collection("Task");
  db.items = database.collection("Item");
  db.groups = database.collection("Group");
  db.texts = database.collection("Filter_Text");
  return "done.";
}

module.exports = { connectToDb, db };
