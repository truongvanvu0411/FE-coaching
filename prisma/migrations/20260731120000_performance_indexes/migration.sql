-- Supporting indexes for learner question filtering, progress aggregation,
-- and the admin ingest queue. All indexes are additive and safe to re-run via
-- Prisma's migration history only once.
CREATE INDEX "Question_verified_reviewStatus_isObsolete_createdAt_idx"
  ON "Question"("verified", "reviewStatus", "isObsolete", "createdAt");

CREATE INDEX "Question_topicId_difficulty_verified_reviewStatus_idx"
  ON "Question"("topicId", "difficulty", "verified", "reviewStatus");

CREATE INDEX "IngestJob_status_createdAt_idx"
  ON "IngestJob"("status", "createdAt");

CREATE INDEX "Attempt_userId_isCorrect_idx"
  ON "Attempt"("userId", "isCorrect");
