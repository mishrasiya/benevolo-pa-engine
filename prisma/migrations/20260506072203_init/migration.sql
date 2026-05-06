-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'PROVIDER',
    "hashedPassword" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PARequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "patientName" TEXT NOT NULL,
    "patientDOB" TEXT NOT NULL,
    "patientMemberId" TEXT NOT NULL,
    "diagnosisCodes" TEXT NOT NULL,
    "procedureCode" TEXT NOT NULL,
    "procedureDescription" TEXT NOT NULL,
    "payer" TEXT NOT NULL,
    "urgency" TEXT NOT NULL DEFAULT 'ROUTINE',
    "clinicalNotes" TEXT NOT NULL,
    "documentationUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "aiVerdict" TEXT,
    "aiConfidence" REAL,
    "aiRationale" TEXT,
    "aiDocGaps" TEXT,
    "aiSuggestedCodes" TEXT,
    "turnaroundEstimate" TEXT,
    "appealStrength" TEXT,
    "aiSummary" TEXT,
    "providerId" TEXT NOT NULL,
    CONSTRAINT "PARequest_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paRequestId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    "details" TEXT,
    CONSTRAINT "AuditEntry_paRequestId_fkey" FOREIGN KEY ("paRequestId") REFERENCES "PARequest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProviderNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paRequestId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    CONSTRAINT "ProviderNote_paRequestId_fkey" FOREIGN KEY ("paRequestId") REFERENCES "PARequest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProviderNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
