import path from "path";
import { promises as fs } from "fs";

export default async function handler(req, res) {
  // Get user data from db
  const DB_PATH = path.join(process.cwd(), "json");
  let dbData = await fs.readFile(DB_PATH + "/db.json", "utf8");
  dbData = JSON.parse(dbData);

  // Get grid size from the request
  const { gridSize } = req.query;
  console.log(gridSize);

  // Get leaderboard data for grid size
  const leaderboard = dbData
    .reduce((acc, data) => {
      return data.scores[gridSize] > 0
        ? [
            ...acc,
            {
              username: data.username,
              score: data.scores[gridSize],
            },
          ]
        : acc;
    }, [])
    .sort((a, b) => b.score - a.score);

  // Return the leaderboard data for grid size
  res.status(200).json({ status: "success", leaderboard });
}
