const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, enum: ["video"], required: true },
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Video", videoSchema);
