import test from "node:test";
import assert from "node:assert/strict";
import { extractJsonBlock, isValidQuizPayload, safeJsonParse } from "../api/chatValidation.js";

test("extractJsonBlock handles fenced json", () => {
  const raw = "text ```json\n{\"a\":1}\n``` tail";
  assert.equal(extractJsonBlock(raw), "{\"a\":1}");
});

test("extractJsonBlock handles plain object snippet", () => {
  const raw = "foo {\"x\":2} bar";
  assert.equal(extractJsonBlock(raw), "{\"x\":2}");
});

test("safeJsonParse returns null for invalid json", () => {
  assert.equal(safeJsonParse("{bad}"), null);
});

test("isValidQuizPayload validates required schema", () => {
  const ok = {
    question: "Q",
    options: { A: "1", B: "2", C: "3", D: "4" },
    answer: "A",
    explanation: "E"
  };
  assert.equal(isValidQuizPayload(ok), true);
  assert.equal(isValidQuizPayload({ ...ok, answer: "Z" }), false);
  assert.equal(isValidQuizPayload({ ...ok, options: { A: "", B: "2", C: "3", D: "4" } }), false);
});
