const express = require("express");
const multer = require("multer");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const mongoose = require("mongoose");
const Video = require("./models/videoModel");
const Image = require("./models/imageModel");
const Audio = require("./models/audioModel");
const mediaRoutes = require("./routes/mediaRoutes"); 


// for connect to mongo
mongoose
  .connect("mongodb+srv://jerry:V6VOlj5tu6Ne70VS@jerry.lubfo.mongodb.net/")
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Cloudinary Configuration
cloudinary.config({
  cloud_name: "dcumlijfr",
  api_key: "862294648318396",
  api_secret: "UpLEAdZeSp734471eMzBQkuCyec",
});
// hhdfhv
const app = express();
// for accept big files
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));//for complex data

// for accept frontend request
app.use(cors());
// for media roues video,audio,image
app.use("/media", mediaRoutes);
// Multer configuration: Store files in memory/ram
const storage = multer.memoryStorage();
// call to multer and telling configuration like save file in ram
const upload = multer({ storage: storage });

// take request here
app.post("/upload", upload.fields([{ name: "file" }, { name: "image" }]), async (req, res) => {
  try {
    if (!req.files || (!req.files.file && !req.files.image)) {
      return res.status(400).json({ message: "No files uploaded!" });
    }

    let uploadedFiles = [];
    let imageUrl = null; // Store the image URL to use for the audio file

    // First, process the image if it exists
    if (req.files.image) {
      const imageFile = req.files.image[0];

      // Upload image to Cloudinary
      const imageResponse = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "jerry_images", resource_type: "image" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        // send files to readable form to cloudinary
        streamifier.createReadStream(imageFile.buffer).pipe(stream);
      });

      // Save image to MongoDB
      // const newImage = new Image({
      //   url: imageResponse.secure_url,
      //   type: "image",
      // });
      // await newImage.save();

      // Store image URL for audio file association
      imageUrl = imageResponse.secure_url;
    }

    // Process other files (audio/video)
    if (req.files.file) {
      for (let file of req.files.file) {
        const mimeType = file.mimetype;
        let folderName = "jerry_others";
        let resourceType = "auto";

        if (mimeType.startsWith("image/")) { 
          folderName = "jerry_images";  
          resourceType = "image";  
        }
        else if (mimeType.startsWith("audio/")) {
          folderName = "jerry_audio";
          resourceType = "video"; // Cloudinary treats audio as video
        } else if (mimeType.startsWith("video/")) {
          folderName = "jerry_videos";
          resourceType = "video";
        }

        // Upload audio/video to Cloudinary
        const cloudinaryResponse = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: folderName, resource_type: resourceType },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          // convert to readable form and send to cloudinary
          streamifier.createReadStream(file.buffer).pipe(stream);
        });

        uploadedFiles.push({
          url: cloudinaryResponse.secure_url,
          type: resourceType,
        });

        // Save to MongoDB based on file type
        if(mimeType.startsWith('image/')){
          // create instance
          const newImage= new Image({
            url:cloudinaryResponse.secure_url,
            type:'image'
          });
          await newImage.save();
        }
        else if (mimeType.startsWith("audio/")) {
          const newAudio = new Audio({
            title: req.body.title || "Untitled", // Default title if not provided
            url: cloudinaryResponse.secure_url,
            imageUrl: imageUrl, // Use the previously uploaded image URL
            type: "audio",
          });
          await newAudio.save();
        } else if (mimeType.startsWith("video/")) {
          const newVideo = new Video({
            title: req.body.title || "Untitled",
            url: cloudinaryResponse.secure_url,
            type: "video",
          });
          await newVideo.save();
        }
      }
    }
    // send response to frontend
    res.json({ message: "Files uploaded successfully", files: uploadedFiles });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: "Internal Server Errorttttt", error });
  }
});

// Start server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
