import test from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import HighlightedText from "../src/components/HighlightedText";
import ErrorPage from "../src/app/error";
import QuizForm from "../src/components/QuizForm";

test("search highlighting preserves Vietnamese accents and escapes user-controlled text", () => {
  const html = renderToStaticMarkup(<HighlightedText text={'Đạo hàm và gradient <script>alert("x")</script>'} query="dao ham" />);
  assert.match(html, /<mark>Đạo<\/mark> <mark>hàm<\/mark>/);
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(!html.includes("<script>"));
  assert.ok(html.includes(" và gradient "));
  const decomposed = renderToStaticMarkup(<HighlightedText text={"Đạo hàm".normalize("NFD")} query="dao" />);
  assert.ok(decomposed.startsWith("<mark>"));
  assert.equal(decomposed.replace(/<\/?mark>/g, ""), "Đạo hàm".normalize("NFD"));
});

test("public error UI provides recovery without rendering internal exception details", () => {
  const html = renderToStaticMarkup(<ErrorPage error={new Error("SQL error at /private/fixture.db")} reset={() => {}} />);
  assert.ok(!html.includes("/private/fixture.db"));
  assert.ok(!html.includes("SQL error"));
  assert.ok(html.includes("Thử lại"));
  assert.ok(html.includes('href="/courses"'));
  assert.ok(html.includes("<h1>"));
});

test("anonymous quiz deep links have a destination without exposing answer fields", () => {
  const html = renderToStaticMarkup(<QuizForm quizId="fixture" loggedIn={false} questions={[{ id: "q", prompt: "fixture prompt", options: ["fixture option"] }]} />);
  assert.ok(html.includes('id="quiz"'));
  assert.ok(html.includes('href="/login"'));
  assert.ok(html.includes('aria-labelledby="quiz-title-fixture"'));
  assert.ok(!html.includes("fixture prompt"));
  assert.ok(!html.includes("fixture option"));
  assert.ok(!html.includes('type="radio"'));
});
