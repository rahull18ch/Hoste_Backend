const mongoose = require("mongoose");



const DumySchema = new mongoose.Schema({
  title: String,      // e.g. "Hostel FAQ"
  text: String,       // actual chunk of text
  type: String,       // "faq" | "rule" | "notice"
  source: String,     // file name or section
  chunkIndex: Number, // 0,1,2,3...
  embedding: [Number] // array of floats
});

module.exports = mongoose.model("DumySchema", DumySchema);
