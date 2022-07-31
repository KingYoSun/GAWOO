/*
  Warnings:

  - The primary key for the `Follow` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `followerDid` on the `Follow` table. All the data in the column will be lost.
  - Added the required column `userDid` to the `Follow` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Follow" (
    "userDid" TEXT NOT NULL,
    "followingDid" TEXT NOT NULL,

    PRIMARY KEY ("userDid", "followingDid"),
    CONSTRAINT "Follow_userDid_fkey" FOREIGN KEY ("userDid") REFERENCES "User" ("did") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Follow_followingDid_fkey" FOREIGN KEY ("followingDid") REFERENCES "User" ("did") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Follow" ("followingDid") SELECT "followingDid" FROM "Follow";
DROP TABLE "Follow";
ALTER TABLE "new_Follow" RENAME TO "Follow";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
