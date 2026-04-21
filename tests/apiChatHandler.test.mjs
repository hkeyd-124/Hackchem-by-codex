import test from "node:test";
import assert from "node:assert/strict";
import handler from "../api/chat.js";

function createResCollector() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
}

test("returns 405 for non-POST method", async () => {
  const req = { method: "GET", body: {} };
  const res = createResCollector();

  await handler(req, res);

  assert.equal(res.statusCode, 405);
  assert.equal(typeof res.body.reply, "string");
});

test("quiz mode returns safe fallback when upstream is HTML 502", async () => {
  global.fetch = async () => ({
    ok: false,
    status: 502,
    text: async () => "<html><h1>502 Bad Gateway</h1></html>"
  });

  const req = { method: "POST", body: { mode: "quiz", message: "alkane" } };
  const res = createResCollector();

  await handler(req, res);

  assert.equal(res.statusCode, 502);
  const parsed = JSON.parse(res.body.reply);
  assert.equal(typeof parsed.question, "string");
  assert.equal(parsed.answer, "D");
});

test("normal mode returns safe upstream error message when upstream is HTML 502", async () => {
  global.fetch = async () => ({
    ok: false,
    status: 502,
    text: async () => "<html><h1>502 Bad Gateway</h1></html>"
  });

  const req = { method: "POST", body: { message: "hello" } };
  const res = createResCollector();

  await handler(req, res);

  assert.equal(res.statusCode, 502);
  assert.match(res.body.reply, /upstream/i);
});

test("quiz mode returns normalized quiz when upstream response is valid", async () => {
  const upstream = {
    choices: [
      {
        message: {
          content: JSON.stringify({
            question: "Q",
            options: { A: "1", B: "2", C: "3", D: "4" },
            answer: "A",
            explanation: "E"
          })
        }
      }
    ]
  };

  global.fetch = async () => ({
    ok: true,
    status: 200,
    text: async () => JSON.stringify(upstream)
  });

  const req = { method: "POST", body: { mode: "quiz", message: "alkene" } };
  const res = createResCollector();

  await handler(req, res);

  assert.equal(res.statusCode, 200);
  const parsed = JSON.parse(res.body.reply);
  assert.equal(parsed.answer, "A");
  assert.equal(parsed.options.D, "4");
});
