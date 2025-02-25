const express = require("express");
const router = express.Router();
const Video = require("../models/videoModel");
const Image = require("../models/imageModel");
const Audio = require("../models/audioModel"); 

router.get("/videos", async (req, res) => {
  try {
    const videos = await Video.find();
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: "Error fetching videos" });
  }
});

router.get("/images", async (req, res) => {
  try {
    const images = await Image.find();
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: "Error fetching images" });
  }
});

router.get("/audios", async (req, res) => {
  try {
    const audios = await Audio.find();
    res.json(audios);
  } catch (error) {
    res.status(500).json({ message: "Error fetching audios" });
  }
});

module.exports = router;
