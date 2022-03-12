-- CreateTable
CREATE TABLE "Post" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cid" TEXT,
    "content" TEXT,
    "published_at" TEXT,
    "authorDid" TEXT,
    CONSTRAINT "Post_authorDid_fkey" FOREIGN KEY ("authorDid") REFERENCES "User" ("did") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "did" TEXT,
    "name" TEXT,
    "avatar" TEXT
);

-- CreateTable
CREATE TABLE "Follow" (
    "followerDid" TEXT NOT NULL,
    "followingDid" TEXT NOT NULL,

    PRIMARY KEY ("followerDid", "followingDid"),
    CONSTRAINT "Follow_followerDid_fkey" FOREIGN KEY ("followerDid") REFERENCES "User" ("did") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Follow_followingDid_fkey" FOREIGN KEY ("followingDid") REFERENCES "User" ("did") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Post_cid_key" ON "Post"("cid");

-- CreateIndex
CREATE UNIQUE INDEX "User_did_key" ON "User"("did");
