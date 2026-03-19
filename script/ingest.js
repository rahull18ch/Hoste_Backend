// scripts/ingestDumySchema.js
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const DumySchema = require("../model/Dumy");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// 1. Connect to Mongo
async function connectDB() {
  await mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log("Mongo connected");
}

// 2. Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 3. Embedding model (Gemini embeddings)
const embedModel = genAI.getGenerativeModel({
  model: "gemini-embedding-001" // recommended embedding model
});

// 4. Get embedding for a piece of text
async function embedText(text) {
  const res = await embedModel.embedContent(text);
  // res.embedding.values is a float array
  return res.embedding.values || [];
}

// 5. Simple chunking function
function chunkText(raw, maxLen = 500) {
  const lines = raw.split("\n");
  const chunks = [];
  let current = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if ((current + " " + trimmed).length > maxLen) {
      chunks.push(current.trim());
      current = trimmed;
    } else {
      current += " " + trimmed;
    }
  }

  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

async function main() {
  try {
    await connectDB();

    // Optional: clear old data
    await DumySchema.deleteMany({});
    console.log("Cleared old DumySchema");

    const files = [
      { file: "hostel_faq.txt", type: "faq", title: "Hostel FAQ" },
      { file: "hostel_rules.txt", type: "rule", title: "Hostel Rules" }
    ];

    for (const f of files) {
      const filePath = path.join(__dirname, "..", "data", f.file);
      if (!fs.existsSync(filePath)) {
        console.log(`File not found, skipping: ${f.file}`);
        continue;
      }

      const raw = fs.readFileSync(filePath, "utf-8");
      const chunks = chunkText(raw);

      console.log(`File ${f.file} -> ${chunks.length} chunks`);

      for (let i = 0; i < chunks.length; i++) {
        const text = chunks[i];

        try {
          const embedding = await embedText(text);

          await DumySchema.create({
            title: f.title,
            text,
            type: f.type,
            source: f.file,
            chunkIndex: i,
            embedding
          });

          console.log(`Inserted ${f.file} chunk ${i}`);
        } catch (err) {
          console.error(`Error embedding chunk ${i} of ${f.file}:`, err.message);
        }
      }
    }

    console.log("Done ingestion");
    process.exit(0);
  } catch (err) {
    console.error("Ingestion error:", err);
    process.exit(1);
  }
}

main();
//node scripts/mew.js
