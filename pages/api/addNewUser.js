import path from "path";
import { promises as fs } from "fs";

const DB_PATH = path.resolve(process.cwd(), "data") + "/db.json";

export default async function handler(req, res) {
  if (req.method === "POST") {
    // Get user data from db
    const DB_PATH = "./json";
    let dbData = await fs.readFile(DB_PATH + "/db.json", "utf8");
    dbData = JSON.parse(dbData);

    // Get username from the request
    const username = req.body.username;

    // Check if username empty or undefined
    if (username === "" || !username) {
      res
        .status(401)
        .json({ status: "failed", message: "Enter a valid username" });
      return;
    }

    // Check if username is valid
    if (
      /^(?=.{8,15}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/.test(
        username
      ) === false
    ) {
      res
        .status(401)
        .json({ status: "failed", message: "Enter a valid username" });
      return;
    }

    // Check if username already exists in db
    const userExists =
      dbData.findIndex((user) => user.username === username) >= 0;

    if (userExists) {
      res
        .status(303)
        .json({ status: "failed", message: "Username already taken" });
      return;
    }

    // Add user to db
    const dt = new Date();
    const newUser = {
      username: username,
      createdAt: dt,
      lastPlayedAt: dt,
      scores: {
        2: 0,
        4: 0,
        6: 0,
        8: 0,
      },
    };
    const updatedDBData = [...dbData, newUser];

    await fs.writeFile(DB_PATH + "/db.json", JSON.stringify(updatedDBData));

    res.status(200).json({ status: "success", message: "User created" });
  } else {
    res.status(200).json({ status: "success", message: "API works" });
  }
}
