export type GradingQ = { id: string; correctIndex: number; explanation: string };
export function gradeQuiz(qs: GradingQ[], answers: Record<string, number>) {
  const results = qs.map(q => ({ id: q.id, correct: answers[q.id] === q.correctIndex, correctIndex: q.correctIndex, explanation: q.explanation }));
  return { score: results.filter(r => r.correct).length, total: qs.length, results };
}
