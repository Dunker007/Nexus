-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "owner" TEXT,
    "icon" TEXT,
    "href" TEXT,
    "agents" TEXT NOT NULL,
    "timeline" TEXT NOT NULL,
    "stats" TEXT NOT NULL,
    "content" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "NewsItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "pubDate" DATETIME NOT NULL,
    "category" TEXT NOT NULL,
    "region" TEXT,
    "saved" BOOLEAN NOT NULL DEFAULT false,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ContentQueueItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "result" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Project_category_idx" ON "Project"("category");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "NewsItem_sourceId_idx" ON "NewsItem"("sourceId");

-- CreateIndex
CREATE INDEX "NewsItem_pubDate_idx" ON "NewsItem"("pubDate");

-- CreateIndex
CREATE UNIQUE INDEX "NewsItem_link_key" ON "NewsItem"("link");

-- CreateIndex
CREATE INDEX "ContentQueueItem_type_idx" ON "ContentQueueItem"("type");

-- CreateIndex
CREATE INDEX "ContentQueueItem_createdAt_idx" ON "ContentQueueItem"("createdAt");

-- CreateIndex
CREATE INDEX "SystemSetting_category_idx" ON "SystemSetting"("category");
