import path from "path";
import { promises as fs } from "fs";

const DB_PATH = path.resolve(process.cwd(), "data") + "/db.json";

export default async function handler(req, res) {
  if (req.method === "POST") {
    // Get user data from db
    const DB_PATH = path.join(process.cwd(), "json");
    let dbData = await fs.readFile(DB_PATH + "/db.json", "utf8");
    dbData = JSON.parse(dbData);

    // Get data from the request
    const { username, toUpdate, payload } = req.body;

    // Update required data
    let updatedDBData;
    const dt = new Date();

    switch (toUpdate) {
      case "lastPlayedAt":
        updatedDBData = dbData.map((data) =>
          data.username !== username ? data : { ...data, lastPlayedAt: dt }
        );
        break;

      case "score":
        updatedDBData = dbData.map((data) => {
          if (data.username !== username) return data;

          const scores = { ...data.scores };
          scores[payload.gridSize] = payload.score;
          return { ...data, lastPlayedAt: dt, scores };
        });
        break;

      default:
        updatedDBData = [...dbData];
    }

    // Add updated user data to db
    await fs.writeFile(DB_PATH + "/db.json", JSON.stringify(updatedDBData));

    res.status(200).json({ status: "success", message: "User updated" });
  } else {
    res.status(200).json({ status: "success", message: "API works" });
  }
}
