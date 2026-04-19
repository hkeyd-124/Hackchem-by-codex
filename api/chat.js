const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const REQUEST_TIMEOUT_MS = 15000;
const MAX_RETRIES = 1;

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function extractJsonBlock(text) {
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

function isValidQuizPayload(payload) {
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

async function fetchCompletionWithRetry(payload, retries = MAX_RETRIES) {
  let attempt = 0;
  let lastError;

  while (attempt <= retries) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(OPENAI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok && response.status >= 500 && attempt < retries) {
        attempt += 1;
        continue;
      }

      return response;
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err;
      if (attempt >= retries) throw err;
      attempt += 1;
    }
  }

  throw lastError || new Error("OpenAI request failed");
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ reply: "Method không hợp lệ" });
    }

    const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
    const mode = req.body?.mode;
    const isQuiz = mode === "quiz";

    if (!message) {
      return res.status(400).json({ reply: "Thiếu nội dung câu hỏi" });
    }

    // ✅ TẠO messages TRƯỚC
    const messages = isQuiz
      ? [
          {
            role: "system",
            content: `
Bạn là AI tạo câu hỏi trắc nghiệm Hóa học, các chất hóa học thì bạn sẽ luôn gọi tên bằng tiếng anh, còn nội dung câu hỏi thì tiếng việt.
  Tóm lại: 
  + Tiếng anh: Tên hóa chất, loại chất hóa học
  + Tiếng việt: Nội dung câu hỏi, tất cả ngoài trừ Tên hóa chất, loại chất hóa học
========================
QUY TẮC BẮT BUỘC TUYỆT ĐỐI (KHÔNG ĐƯỢC VI PHẠM)
========================

- MỌI công thức hóa học PHẢI nằm trong $...$

- TUYỆT ĐỐI KHÔNG:
  ❌ không viết C6H12O6
  ❌ không viết C_6H_12O_6
  ❌ không viết $$C_6H_12O_6$$ trong đáp án

- CHỈ ĐƯỢC VIẾT:
  ✔ $C_6H_12O_6$

- Nếu thiếu dấu $, PHẢI tự sửa trước khi trả kết quả

========================
TỰ KIỂM TRA TRƯỚC KHI TRẢ VỀ
========================

- Có công thức nào không nằm trong $...$ không?
→ Nếu có: SỬA

- Có $$ trong đáp án không?
→ Nếu có: ĐỔI thành $
- Trả về JSON hợp lệ (KHÔNG giải thích ngoài JSON)

{
  "question": "...",
  "options": {
    "A": "...",
    "B": "...",
    "C": "...",
    "D": "..."
  },
  "answer": "random",
  "explanation": "..."
}
`
          },
          {
            role: "user",
            content: `Tạo 1 câu hỏi về chủ đề: ${message}`
          }
        ]
      : [
          {
            role: "system",
            content: `
Bạn là trợ lý dạy Hóa, Tên các chất hóa học thì bạn luôn gọi tên bằng tiếng anh, còn nội dung trả lời thì bạn dùng tiếng việt.

QUY TẮC:
- Trong câu hỏi và đáp án:
  → PHẢI dùng dạng inline: $C_2H_4$

- CHỈ dùng $$ $$ khi viết phương trình riêng

Ví dụ:
- Đúng: ethylene $C_2H_4$
- Sai: ethylene $$C_2H_4$$

- Phương trình có thể dùng:
$$C_2H_4 + Br_2 → C_2H_4Br_2$$
`
          },
          { role: "user", content: message }
        ];

    // ✅ GỌI API (timeout + retry)
    const response = await fetchCompletionWithRetry({
      model: "gpt-4o-mini",
      messages
    });

    const data = await response.json();

    console.log("DATA:", data);

    const reply = data.choices?.[0]?.message?.content || "AI chưa trả lời";

    if (isQuiz) {
      const extracted = extractJsonBlock(reply);
      const parsed = extracted ? safeJsonParse(extracted) : null;

      if (!isValidQuizPayload(parsed)) {
        return res.status(502).json({
          reply: JSON.stringify({
            question: "Hệ thống đang bận, vui lòng thử lại.",
            options: {
              A: "Thử lại sau 10 giây",
              B: "Kiểm tra kết nối mạng",
              C: "Đổi chủ đề câu hỏi",
              D: "Tất cả đều đúng"
            },
            answer: "D",
            explanation: "Phản hồi AI chưa đúng schema quiz nên đã dùng fallback an toàn."
          })
        });
      }

      return res.status(200).json(parsed);
    }

    res.status(200).json({ reply });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ reply: "Server lỗi thật 😢" });
  }
}
