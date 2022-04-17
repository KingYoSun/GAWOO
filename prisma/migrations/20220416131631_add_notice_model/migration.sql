-- CreateTable
CREATE TABLE "Notice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "read" BOOLEAN NOT NULL,
    "did" TEXT,
    "type" TEXT,
    "content" TEXT,
    "url" TEXT
);
