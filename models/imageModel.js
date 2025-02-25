const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  type: { type: String, enum: ["image"], required: true },
  uploadedAt: { type: Date, default: Date.now },
});

// return a mongoose model  like class
module.exports = mongoose.model("Image", imageSchema);
