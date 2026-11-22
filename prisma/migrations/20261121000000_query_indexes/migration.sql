-- Additive indexes only: no table rebuild, data update, deletion or seed.
CREATE INDEX "Module_courseId_order_idx" ON "Module"("courseId", "order");
CREATE INDEX "Lesson_moduleId_order_idx" ON "Lesson"("moduleId", "order");
CREATE INDEX "LessonProgress_lessonId_idx" ON "LessonProgress"("lessonId");
CREATE INDEX "QuizQuestion_quizId_order_idx" ON "QuizQuestion"("quizId", "order");
CREATE INDEX "QuizAttempt_userId_createdAt_idx" ON "QuizAttempt"("userId", "createdAt");
CREATE INDEX "QuizAttempt_quizId_idx" ON "QuizAttempt"("quizId");
CREATE INDEX "Bookmark_lessonId_idx" ON "Bookmark"("lessonId");
CREATE INDEX "Note_userId_lessonId_id_idx" ON "Note"("userId", "lessonId", "id");
CREATE INDEX "Note_lessonId_idx" ON "Note"("lessonId");
CREATE INDEX "SourceReference_lessonId_idx" ON "SourceReference"("lessonId");
CREATE INDEX "StudyTime_lessonId_idx" ON "StudyTime"("lessonId");
CREATE INDEX "PasswordReset_userId_usedAt_idx" ON "PasswordReset"("userId", "usedAt");
