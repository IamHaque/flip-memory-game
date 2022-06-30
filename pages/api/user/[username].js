import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ status: "failed", scores: null });
  }

  // Get username from the request
  const { username } = req.query;

  // Return if username or scores are not provided
  if (username === "" || !username) {
    return res.status(401).json({ status: "failed", scores: null });
  }

  // Get user data from db
  const user = await prisma.users.findUnique({
    where: {
      username: username,
    },
  });

  // Return if no user found in DB
  if (!user) {
    return res.status(303).json({ status: "failed", scores: null });
  }

  // Return the scores for the user
  const scores = {
    2: user["score2x2"],
    4: user["score4x4"],
    6: user["score6x6"],
    8: user["score8x8"],
  };
  return res.status(200).json({ status: "success", scores });
}
