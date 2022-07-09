/*
  Warnings:

  - The primary key for the `Notice` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Notice` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `Post` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Post` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `Subscribe` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Subscribe` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `User` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Notice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "did" TEXT,
    "type" TEXT,
    "content" TEXT,
    "url" TEXT,
    "createdAt" TEXT
);
INSERT INTO "new_Notice" ("content", "createdAt", "did", "id", "read", "type", "url") SELECT "content", "createdAt", "did", "id", "read", "type", "url" FROM "Notice";
DROP TABLE "Notice";
ALTER TABLE "new_Notice" RENAME TO "Notice";
CREATE TABLE "new_Post" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cid" TEXT,
    "content" TEXT,
    "publishedAt" TEXT,
    "authorName" TEXT,
    "authorAvatar" TEXT,
    "authorAvatarMime" TEXT,
    "authorDid" TEXT,
    "topicCid" TEXT,
    "replyToCid" TEXT,
    CONSTRAINT "Post_authorDid_fkey" FOREIGN KEY ("authorDid") REFERENCES "User" ("did") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Post" ("authorAvatar", "authorAvatarMime", "authorDid", "authorName", "cid", "content", "id", "publishedAt", "replyToCid", "topicCid") SELECT "authorAvatar", "authorAvatarMime", "authorDid", "authorName", "cid", "content", "id", "publishedAt", "replyToCid", "topicCid" FROM "Post";
DROP TABLE "Post";
ALTER TABLE "new_Post" RENAME TO "Post";
CREATE TABLE "new_Subscribe" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "channel" TEXT NOT NULL,
    "type" TEXT
);
INSERT INTO "new_Subscribe" ("channel", "id", "type") SELECT "channel", "id", "type" FROM "Subscribe";
DROP TABLE "Subscribe";
ALTER TABLE "new_Subscribe" RENAME TO "Subscribe";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "did" TEXT,
    "name" TEXT,
    "avatar" TEXT
);
INSERT INTO "new_User" ("avatar", "did", "id", "name") SELECT "avatar", "did", "id", "name" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_did_key" ON "User"("did");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
