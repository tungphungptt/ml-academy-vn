import test from "node:test";
import assert from "node:assert/strict";
import {safeReturnPath,authHref} from "../src/lib/returnPath";
test("auth keeps the lesson/quiz destination through registration",()=>{
  const next="/learn/imbalanced-learning#quiz";
  assert.equal(safeReturnPath(next),next);
  assert.equal(new URL(authHref("register",next),"https://neuralclone.site").searchParams.get("next"),next);
  assert.equal(safeReturnPath("/lab?lab=rag_retrieval"),"/lab?lab=rag_retrieval");
});
test("auth never accepts an external, ambiguous or auth-loop destination",()=>{
  for(const input of [undefined,["/courses"],"https://evil.example/","//evil.example/","/\\evil.example/","/\n/evil.example","/login?next=/login","/api/logout","javascript:alert(1)"])assert.equal(safeReturnPath(input),"/");
});
