import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(404).json({ data: "Route not defined" });
  }

  try {
    const allUsers = await prisma.users.findMany({
      orderBy: [
        {
          updatedAt: "desc",
        },
      ],
    });
    return res.status(200).json({ data: allUsers });
  } catch (e) {
    return res.status(404).json({ data: "Route not defined" });
  }
}
