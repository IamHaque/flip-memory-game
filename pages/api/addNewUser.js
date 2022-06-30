import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ status: "failed", message: "Method not allowed" });
  }

  // Get username from the request
  const username = req.body.username;

  // Check if username empty or undefined
  if (username === "" || !username) {
    return res
      .status(401)
      .json({ status: "failed", message: "Enter a valid username" });
  }

  // Check if username is valid
  if (
    /^(?=.{8,15}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/.test(
      username
    ) === false
  ) {
    return res
      .status(401)
      .json({ status: "failed", message: "Enter a valid username" });
  }

  try {
    // Add user to db
    await prisma.users.create({
      data: {
        username,
        score2x2: 0,
        score4x4: 0,
        score6x6: 0,
        score8x8: 0,
      },
    });

    return res.status(200).json({ status: "success", message: "User created" });
  } catch (e) {
    // Handling DB write error
    const errorData =
      e.meta && e.meta.target
        ? e.meta.target.map((item) => `${item} already exists.`)
        : e;
    return res.status(404).json({ status: "failed", message: errorData });
  }
}
