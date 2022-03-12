/*
  Warnings:

  - You are about to alter the column `published_at` on the `Post` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Post" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cid" TEXT,
    "content" TEXT,
    "published_at" INTEGER,
    "authorDid" TEXT,
    CONSTRAINT "Post_authorDid_fkey" FOREIGN KEY ("authorDid") REFERENCES "User" ("did") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Post" ("authorDid", "cid", "content", "id", "published_at") SELECT "authorDid", "cid", "content", "id", "published_at" FROM "Post";
DROP TABLE "Post";
ALTER TABLE "new_Post" RENAME TO "Post";
CREATE UNIQUE INDEX "Post_cid_key" ON "Post"("cid");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
