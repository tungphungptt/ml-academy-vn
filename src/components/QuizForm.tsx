"use client";
import { useEffect, useState } from "react";
import { shuffleIdx } from "@/lib/search";
import MarkdownContent from "./MarkdownContent";
import Icon from "./Icon";
type Q = { id: string; prompt: string; options: string[] };
type Res = { id: string; correct: boolean; correctIndex: number; explanation: string };
type Result = { score: number; total: number; results: Res[] };
export default function QuizForm({ quizId, questions, loggedIn }: { quizId: string; questions: Q[]; loggedIn: boolean }) {
  const [ans, setAns] = useState<Record<string, number>>({}), [seed, setSeed] = useState(0);
  const [out, setOut] = useState<Result | null>(null), [err, setErr] = useState(""), [busy, setBusy] = useState(false);
  useEffect(() => setSeed(Date.now() % 1e9), []);
  if (!loggedIn) return <section id="quiz" className="quiz-panel" aria-labelledby={`quiz-title-${quizId}`}><header className="quiz-heading"><h2 id={`quiz-title-${quizId}`}>Quiz</h2><span className="badge neutral">{questions.length} câu hỏi</span></header><p className="notice"><Icon name="user" /><span><a href="/login">Đăng nhập</a> để làm quiz, đọc lời giải và lưu điểm.</span></p></section>;
  const order = (q: Q, k: number) => seed ? shuffleIdx(q.options.length, seed + k) : q.options.map((_, i) => i);
  async function submit() {
    if (busy) return;
    setErr(""); setBusy(true);
    try {
      const r = await fetch("/api/quiz", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ quizId, answers: ans }) });
      if (r.ok) setOut(await r.json()); else setErr("Không nộp được bài. Lựa chọn của bạn vẫn được giữ; hãy thử lại.");
    } catch { setErr("Chưa kết nối được. Lựa chọn của bạn vẫn được giữ; hãy thử lại khi có mạng."); }
    finally { setBusy(false); }
  }
  const answered = Object.keys(ans).length;
  return <section id="quiz" className="quiz-panel" aria-labelledby={`quiz-title-${quizId}`}>
    <header className="quiz-heading"><div><p className="eyebrow">DỪNG LẠI & TỰ KIỂM TRA</p><h2 id={`quiz-title-${quizId}`}>Quiz</h2><p>Chọn câu trả lời của bạn. Lời giải chỉ xuất hiện sau khi nộp.</p></div><span className="badge neutral">{questions.length} câu hỏi</span></header>
    <div className="quiz-progress"><p aria-live="polite"><span>{out ? "Đã kiểm tra" : `Đã trả lời ${answered}/${questions.length} câu`}</span><span>{out ? `${out.score}/${out.total} đúng` : "Mỗi câu chọn một đáp án"}</span></p><progress aria-label="Tiến độ trả lời quiz" value={answered} max={questions.length || 1} /></div>
    {questions.map((q, k) => { const r = out?.results.find(x => x.id === q.id); return <fieldset key={q.id} disabled={!!out || busy}><legend><span className="question-number">{String(k + 1).padStart(2, "0")}</span><MarkdownContent inline>{q.prompt}</MarkdownContent></legend>
      {order(q, k).map(j => <label key={j} data-option-index={j} className={`opt${ans[q.id] === j ? " selected" : ""}${r && j === r.correctIndex ? " right" : r && ans[q.id] === j ? " wrong" : ""}`}><input type="radio" name={q.id} checked={ans[q.id] === j} onChange={() => setAns({ ...ans, [q.id]: j })} /><span className="option-copy"><MarkdownContent inline>{q.options[j]}</MarkdownContent></span>{r && j === r.correctIndex ? <span className="option-state"><Icon name="check" />Đáp án đúng</span> : ans[q.id] === j ? <span className="option-state">Bạn chọn</span> : null}</label>)}
      {r && <p className="quiz-feedback"><strong><Icon name={r.correct ? "check" : "alert"} />{r.correct ? "Đúng. " : "Chưa đúng. "}</strong><MarkdownContent inline>{r.explanation}</MarkdownContent></p>}
    </fieldset>; })}
    {out ? <div className="quiz-result" role="status"><div><p><b>Điểm: {out.score}/{out.total}</b></p><small>Đọc lời giải ở từng câu rồi thử lại để củng cố kiến thức.</small></div><button onClick={() => { setOut(null); setAns({}); setErr(""); setSeed(Date.now() % 1e9); }}>Làm lại (xáo trộn lại)</button></div> : <div className="quiz-actions"><button className="primary" onClick={submit} disabled={busy || answered < questions.length}>{busy && <span className="spinner" aria-hidden="true" />}{busy ? "Đang kiểm tra…" : "Nộp bài"}</button><span>Thứ tự lựa chọn được xáo trộn mỗi lần làm.</span></div>}
    {err && <p className="notice error" role="alert">{err}</p>}
  </section>;
}
