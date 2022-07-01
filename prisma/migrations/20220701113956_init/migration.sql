-- CreateTable
CREATE TABLE "Users" (
    "score2x2" INTEGER NOT NULL,
    "score4x4" INTEGER NOT NULL,
    "score6x6" INTEGER NOT NULL,
    "score8x8" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL PRIMARY KEY
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_username_key" ON "Users"("username");
