const mongoose = require("mongoose");

const audioSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  imageUrl:{ type: String, required: true },
  type: { type: String, enum: ["audio"], required: true },
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Audio", audioSchema);
