import mongoose from "mongoose";
import dotenv from "dotenv";
import Video from "../Modals/video.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "../uploads");

async function seedVideos() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DB_URL, {
      dbName: "Youtube",
      authSource: "admin",
    });
    console.log("✅ Connected to MongoDB");

    // Get all MP4 files from uploads folder
    const files = fs.readdirSync(uploadsDir).filter(file => file.endsWith('.mp4'));
    console.log(`📁 Found ${files.length} MP4 files in uploads folder`);

    let addedCount = 0;

    for (const filename of files) {
      const filePath = path.join(uploadsDir, filename);
      const fileStats = fs.statSync(filePath);

      // Check if video already exists in database
      const existingVideo = await Video.findOne({ filename });
      if (existingVideo) {
        console.log(`⏭️  Skipping: ${filename} (already in database)`);
        continue;
      }

      // Create new video entry
      const videoEntry = new Video({
        videotitle: filename.replace(/^[\d\-T:.Z]+/, '').replace(/\.mp4$/, ''), // Remove timestamp
        description: "Imported from uploads folder",
        category: "Uncategorized",
        filename: filename,
        filepath: `uploads/${filename}`,
        filetype: "video/mp4",
        filesize: fileStats.size,
        videochanel: "Default Channel",
        uploader: "Admin",
        views: 0,
        Like: 0,
      });

      await videoEntry.save();
      console.log(`✅ Added: ${filename}`);
      addedCount++;
    }

    console.log(`\n📊 Seeding complete! Added ${addedCount} new videos to database.`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding videos:", error.message);
    process.exit(1);
  }
}

seedVideos();
