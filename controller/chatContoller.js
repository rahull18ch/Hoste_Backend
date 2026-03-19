import { GoogleGenerativeAI } from "@google/generative-ai";
import DumySchema from "../model/Dumy.js";



const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* ---------- EMBEDDING ---------
GEMINI_API_KEY = "AIzaSyA1t0cikWZd5iiBh9OJxwb_5fu5sd-GWhg"
client = genai.Client(api_key=GEMINI_API_KEY)

# ✅ Use the model that worked: Gemma 3 12B Instruct
MODEL_NAME = "models/gemma-3-12b-it









" 

- */
async function embedQuestion(question) {
  const model = genAI.getGenerativeModel({
    model: "gemini-embedding-001"
  });

  const result = await model.embedContent({
    content: { parts: [{ text: question }] }
  });

  return result.embedding.values;
}

/* ---------- COSINE SIMILARITY ---------- */
function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  const len = Math.min(a.length, b.length);

  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/* ---------- RAG CHAT ---------- */
export const ragChat = async (req, res) => {

  try {
    const { message } = req.body;
    console.log("message is ",message)

    console.log("Message from frontend:", message);

    if (!message || !message.trim()) {
      return res.status(400).json({ reply: "Message required" });
    }

    const queryVector = await embedQuestion(message);

    const docs = await DumySchema.find({});
    if (!docs.length) {
      return res.json({ reply: "No hostel data available" });
    }

  const scoredDocs = docs.map(doc => {
  const score = cosineSimilarity(queryVector, doc.embedding || []);

  console.log("Doc title:", doc.title);
  console.log("Embedding length:", doc.embedding?.length);
  console.log("Similarity score:", score);
  console.log("---------------");

  return { doc, score };
});


    scoredDocs.sort((a, b) => b.score - a.score);
    const topDocs = scoredDocs.slice(0, 3).filter(d => d.score > 0);

    const context = topDocs.map(d => d.doc.text).join("\n\n");
    console.log("Top matched docs:", topDocs.length);
console.log("Context sent to AI:\n", context);


    /* ✅ WORKING CHAT MODEL */
    const model = genAI.getGenerativeModel({
      model: "gemma-3-12b-it"
    });

const prompt = `
You are a helpful and friendly hostel assistant.

Your job is to answer student queries clearly, simply, and to the point using ONLY the provided hostel information.

Instructions:
- Use ONLY the given "Hostel Info" to answer.
- Do NOT make up any information.
- If the answer is not present in the context, say:
  "Sorry, I don't have information about that. Please contact hostel management."
- Keep answers short, simple, and easy to understand.
- Use a polite and helpful tone.
- If needed, explain in 2-4 lines maximum.
- Focus only on relevant details (no extra unnecessary explanation).

Hostel Info:
${context}

Student Question: ${message}
`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text();


    // const result = await model.generateContent(prompt);

console.log("FULL AI RESPONSE:", result);
console.log("TEXT ONLY:", result.response.text());


    res.json({ reply });

  } catch (error) {
    console.error("RAG chat error:", error);
    res.status(500).json({ reply: error.message });
  }
};
