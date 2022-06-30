import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ status: "failed", message: "Method not allowed" });
  }

  // Get data from the request
  const { username, gridSize, score } = req.body;

  // Return if username or scores are not provided
  if (username === "" || !username || !gridSize || score === null) {
    return res
      .status(401)
      .json({ status: "failed", message: "Insufficient data" });
  }

  try {
    let scoreToUpdate = {};
    switch (gridSize) {
      case 2:
        scoreToUpdate = { score2x2: score };
        break;
      case 4:
        scoreToUpdate = { score4x4: score };
        break;
      case 6:
        scoreToUpdate = { score6x6: score };
        break;
      case 8:
        scoreToUpdate = { score8x8: score };
        break;
    }

    const updatedUser = await prisma.users.update({
      where: {
        username: username,
      },
      data: scoreToUpdate,
    });

    return res.status(200).json({ status: "success", message: "User updated" });
  } catch (e) {
    // Handle DB update error
    const errorData = e.meta && e.meta.cause ? e.meta.cause : e;
    return res.status(404).json({ status: "failed", message: errorData });
  }
}
