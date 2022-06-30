-- CreateTable
CREATE TABLE "Users" (
    "score2x2" INTEGER NOT NULL,
    "score4x4" INTEGER NOT NULL,
    "score6x6" INTEGER NOT NULL,
    "score8x8" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL,
    "lastPlayedAt" DATETIME NOT NULL,
    "id" TEXT NOT NULL PRIMARY KEY
);
