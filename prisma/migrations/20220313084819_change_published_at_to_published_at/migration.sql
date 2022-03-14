/*
  Warnings:

  - You are about to drop the column `published_at` on the `Post` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Post" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cid" TEXT,
    "content" TEXT,
    "publishedAt" INTEGER,
    "authorName" TEXT,
    "authorAvatar" TEXT,
    "authorDid" TEXT,
    CONSTRAINT "Post_authorDid_fkey" FOREIGN KEY ("authorDid") REFERENCES "User" ("did") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Post" ("authorAvatar", "authorDid", "authorName", "cid", "content", "id") SELECT "authorAvatar", "authorDid", "authorName", "cid", "content", "id" FROM "Post";
DROP TABLE "Post";
ALTER TABLE "new_Post" RENAME TO "Post";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
