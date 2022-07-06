import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ status: "failed", scores: null });
  }

  // Get grid size from the request
  const { gridSize } = req.query;

  // Return if username or scores are not provided
  if (gridSize === "" || !gridSize) {
    return res.status(401).json({ status: "failed", scores: null });
  }

  try {
    // Get all users from DB
    const users = await prisma.users.findMany({
      orderBy: [
        {
          username: "asc",
        },
      ],
    });

    // Get leaderboard data for grid size
    let leaderboard = users
      .reduce((acc, user) => {
        const score = getGridScoreForUser(user, gridSize);
        return score > 0
          ? [
              ...acc,
              {
                rank: 0,
                score,
                username: user.username,
              },
            ]
          : acc;
      }, [])
      .sort((a, b) => b.score - a.score);

    // Rank the leaderboard appropriately
    let currentRank = 1;
    while (currentRank <= leaderboard.length) {
      const currentUserScore = leaderboard[currentRank - 1].score;
      leaderboard = leaderboard.map((user) => {
        return user.score === currentUserScore
          ? { ...user, rank: currentRank }
          : user;
      });

      const usersWithCurrentUserScore = leaderboard.filter(
        (user) => user.score === currentUserScore
      ).length;
      currentRank += usersWithCurrentUserScore;
    }

    // Return the leaderboard data for grid size
    return res.status(200).json({ status: "success", leaderboard });
  } catch (e) {
    // Handle DB error
    return res.status(404).json({ status: "failed", message: e });
  }
}

const getGridScoreForUser = (user, gridSize) => {
  if (gridSize === "2") return user["score2x2"];
  if (gridSize === "4") return user["score4x4"];
  if (gridSize === "6") return user["score6x6"];
  if (gridSize === "8") return user["score8x8"];
  return null;
};
