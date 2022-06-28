import path from "path";
import { promises as fs } from "fs";

const DB_PATH = path.resolve(process.cwd(), "data") + "/db.json";

export default async function handler(req, res) {
  // Get user data from db
  const DB_PATH = "./json";
  let dbData = await fs.readFile(DB_PATH + "/db.json", "utf8");
  dbData = JSON.parse(dbData);

  // Get username from the request
  const { username } = req.query;
  const userIndex = dbData.findIndex((user) => user.username === username);

  // Check if username exists in db
  if (userIndex < 0) {
    res.status(303).json({ status: "failed", scores: null });
    return;
  }

  // Return the scores for the user
  const scores = dbData[userIndex].scores;
  res.status(200).json({ status: "success", scores });
}
