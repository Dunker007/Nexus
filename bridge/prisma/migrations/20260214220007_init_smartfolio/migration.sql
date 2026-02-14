-- CreateTable
CREATE TABLE "SmartFolioPosition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "units" REAL NOT NULL,
    "cost" REAL NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SmartFolioJournal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "units" REAL,
    "price" REAL,
    "notes" TEXT,
    "timestamp" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "SmartFolioPosition_accountId_idx" ON "SmartFolioPosition"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "SmartFolioPosition_accountId_symbol_key" ON "SmartFolioPosition"("accountId", "symbol");

-- CreateIndex
CREATE INDEX "SmartFolioJournal_accountId_idx" ON "SmartFolioJournal"("accountId");

-- CreateIndex
CREATE INDEX "SmartFolioJournal_timestamp_idx" ON "SmartFolioJournal"("timestamp");
