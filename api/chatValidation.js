export function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function extractJsonBlock(text) {
  if (typeof text !== "string") return null;
  const codeBlock = text.match(/```json\s*([\s\S]*?)\s*```/i);
  if (codeBlock?.[1]) return codeBlock[1].trim();

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1);
  }
  return null;
}

export function isValidQuizPayload(payload) {
  if (!payload || typeof payload !== "object") return false;
  const options = payload.options;
  const answer = payload.answer;

  if (typeof payload.question !== "string" || !payload.question.trim()) return false;
  if (typeof payload.explanation !== "string" || !payload.explanation.trim()) return false;
  if (!options || typeof options !== "object") return false;

  const required = ["A", "B", "C", "D"];
  const hasOptions = required.every((k) => typeof options[k] === "string" && options[k].trim());
  if (!hasOptions) return false;
  if (!required.includes(answer)) return false;

  return true;
}
