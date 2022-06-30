/*
  Warnings:

  - You are about to drop the column `lastPlayedAt` on the `Users` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Users" (
    "score2x2" INTEGER NOT NULL,
    "score4x4" INTEGER NOT NULL,
    "score6x6" INTEGER NOT NULL,
    "score8x8" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL PRIMARY KEY
);
INSERT INTO "new_Users" ("createdAt", "id", "score2x2", "score4x4", "score6x6", "score8x8", "username") SELECT "createdAt", "id", "score2x2", "score4x4", "score6x6", "score8x8", "username" FROM "Users";
DROP TABLE "Users";
ALTER TABLE "new_Users" RENAME TO "Users";
CREATE UNIQUE INDEX "Users_username_key" ON "Users"("username");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
