"use client";
import { useEffect, useState } from "react"; import { shuffleIdx } from "@/lib/search";
import MarkdownContent from "./MarkdownContent";
type Q = { id: string; prompt: string; options: string[] };
type Res = { id: string; correct: boolean; correctIndex: number; explanation: string };
export default function QuizForm({ quizId, questions, loggedIn }: { quizId: string; questions: Q[]; loggedIn: boolean }) {
  const [ans, setAns] = useState<Record<string, number>>({}); const [seed, setSeed] = useState(0);
  const [out, setOut] = useState<{ score: number; total: number; results: Res[] } | null>(null); const [err, setErr] = useState("");
  useEffect(() => setSeed(Date.now() % 1e9), []);  // xáo trộn sau khi mount để tránh lệch hydration
  if (!loggedIn) return <p><a href="/login">Đăng nhập</a> để làm quiz và lưu điểm.</p>;
  const order = (q: Q, k: number) => (seed ? shuffleIdx(q.options.length, seed + k) : q.options.map((_, i) => i));
  async function submit() {
    setErr(""); const r = await fetch("/api/quiz", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ quizId, answers: ans }) });
    if (r.ok) setOut(await r.json()); else setErr("Không nộp được bài");
  }
  const res = (id: string) => out?.results.find(x => x.id === id);
  return <section><h2>Quiz</h2><p style={{ color: "var(--mut)" }}>Thứ tự các lựa chọn được xáo trộn mỗi lần làm. Đáp án chỉ hiện sau khi nộp.</p>
    {questions.map((q, k) => { const r = res(q.id); return <fieldset key={q.id} disabled={!!out} className={r ? (r.correct ? "ok-pop" : "bad-shake") : ""}><legend>{k + 1}. <MarkdownContent inline>{q.prompt}</MarkdownContent></legend>
      {order(q, k).map(j => <label key={j} data-option-index={j} className={"opt" + (r && j === r.correctIndex ? " right" : "")}><input type="radio" name={q.id} checked={ans[q.id] === j} onChange={() => setAns({ ...ans, [q.id]: j })} /> <MarkdownContent inline>{q.options[j]}</MarkdownContent>{r && j === r.correctIndex ? " ✓" : ""}</label>)}
      {r && <p>{r.correct ? "Đúng. " : "Chưa đúng. "}<MarkdownContent inline>{r.explanation}</MarkdownContent></p>}</fieldset>; })}
    {!out ? <button className="primary" onClick={submit} disabled={Object.keys(ans).length < questions.length}>Nộp bài</button>
      : <><p><b>Điểm: {out.score}/{out.total}</b></p><button onClick={() => { setOut(null); setAns({}); setSeed(Date.now() % 1e9); }}>Làm lại (xáo trộn lại)</button></>}
    {err && <p role="alert">{err}</p>}</section>;
}
