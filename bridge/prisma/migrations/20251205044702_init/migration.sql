-- CreateTable
CREATE TABLE "ErrorLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "stack" TEXT,
    "statusCode" INTEGER NOT NULL DEFAULT 500,
    "isOperational" BOOLEAN NOT NULL DEFAULT true,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" TEXT,
    "url" TEXT,
    "body" TEXT,
    "params" TEXT,
    "query" TEXT,
    "metadata" TEXT
);

-- CreateTable
CREATE TABLE "AgentMemory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agentType" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PerformanceMetric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "slow" BOOLEAN NOT NULL DEFAULT false,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" TEXT,
    "path" TEXT,
    "statusCode" INTEGER,
    "metadata" TEXT
);

-- CreateTable
CREATE TABLE "UserSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "email" TEXT,
    "name" TEXT,
    "picture" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenType" TEXT,
    "expiresAt" DATETIME,
    "scope" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastUsed" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AgentTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agentType" TEXT NOT NULL,
    "task" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "result" TEXT,
    "error" TEXT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "duration" INTEGER,
    "metadata" TEXT
);

-- CreateTable
CREATE TABLE "CacheEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SystemMetric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" TEXT
);

-- CreateTable
CREATE TABLE "LLMUsage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "promptTokens" INTEGER,
    "completionTokens" INTEGER,
    "totalTokens" INTEGER,
    "duration" INTEGER NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cost" REAL,
    "metadata" TEXT
);

-- CreateTable
CREATE TABLE "WorkflowTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT,
    "steps" TEXT NOT NULL,
    "author" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "tags" TEXT,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "rating" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "service" TEXT NOT NULL,
    "userId" TEXT,
    "credentials" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastUsed" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "ErrorLog_timestamp_idx" ON "ErrorLog"("timestamp");

-- CreateIndex
CREATE INDEX "ErrorLog_type_idx" ON "ErrorLog"("type");

-- CreateIndex
CREATE INDEX "ErrorLog_statusCode_idx" ON "ErrorLog"("statusCode");

-- CreateIndex
CREATE INDEX "AgentMemory_agentType_idx" ON "AgentMemory"("agentType");

-- CreateIndex
CREATE INDEX "AgentMemory_timestamp_idx" ON "AgentMemory"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "AgentMemory_agentType_key_key" ON "AgentMemory"("agentType", "key");

-- CreateIndex
CREATE INDEX "PerformanceMetric_name_idx" ON "PerformanceMetric"("name");

-- CreateIndex
CREATE INDEX "PerformanceMetric_timestamp_idx" ON "PerformanceMetric"("timestamp");

-- CreateIndex
CREATE INDEX "PerformanceMetric_slow_idx" ON "PerformanceMetric"("slow");

-- CreateIndex
CREATE INDEX "UserSession_userId_idx" ON "UserSession"("userId");

-- CreateIndex
CREATE INDEX "UserSession_email_idx" ON "UserSession"("email");

-- CreateIndex
CREATE INDEX "UserSession_expiresAt_idx" ON "UserSession"("expiresAt");

-- CreateIndex
CREATE INDEX "AgentTask_agentType_idx" ON "AgentTask"("agentType");

-- CreateIndex
CREATE INDEX "AgentTask_status_idx" ON "AgentTask"("status");

-- CreateIndex
CREATE INDEX "AgentTask_startedAt_idx" ON "AgentTask"("startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CacheEntry_key_key" ON "CacheEntry"("key");

-- CreateIndex
CREATE INDEX "CacheEntry_expiresAt_idx" ON "CacheEntry"("expiresAt");

-- CreateIndex
CREATE INDEX "CacheEntry_createdAt_idx" ON "CacheEntry"("createdAt");

-- CreateIndex
CREATE INDEX "SystemMetric_type_idx" ON "SystemMetric"("type");

-- CreateIndex
CREATE INDEX "SystemMetric_timestamp_idx" ON "SystemMetric"("timestamp");

-- CreateIndex
CREATE INDEX "LLMUsage_provider_idx" ON "LLMUsage"("provider");

-- CreateIndex
CREATE INDEX "LLMUsage_model_idx" ON "LLMUsage"("model");

-- CreateIndex
CREATE INDEX "LLMUsage_timestamp_idx" ON "LLMUsage"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowTemplate_name_key" ON "WorkflowTemplate"("name");

-- CreateIndex
CREATE INDEX "WorkflowTemplate_category_idx" ON "WorkflowTemplate"("category");

-- CreateIndex
CREATE INDEX "WorkflowTemplate_usageCount_idx" ON "WorkflowTemplate"("usageCount");

-- CreateIndex
CREATE INDEX "Integration_service_idx" ON "Integration"("service");

-- CreateIndex
CREATE INDEX "Integration_userId_idx" ON "Integration"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Integration_service_userId_key" ON "Integration"("service", "userId");
