-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Notice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "did" TEXT,
    "type" TEXT,
    "content" TEXT,
    "url" TEXT
);
INSERT INTO "new_Notice" ("content", "did", "id", "read", "type", "url") SELECT "content", "did", "id", "read", "type", "url" FROM "Notice";
DROP TABLE "Notice";
ALTER TABLE "new_Notice" RENAME TO "Notice";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
