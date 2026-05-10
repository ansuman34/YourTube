import mongoose from "mongoose";
import dotenv from "dotenv";
import Video from "../Modals/video.js";
import User from "../Modals/Auth.js";

dotenv.config();

async function updateVideoUploaders() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DB_URL, {
      dbName: "Youtube",
      authSource: "admin",
    });
    console.log("✅ Connected to MongoDB");

    // Find all videos
    const videos = await Video.find({});
    console.log(`📁 Found ${videos.length} videos to check`);

    let updatedCount = 0;

    for (const video of videos) {
      if (!video.uploader) {
        console.log(`⏭️  Skipping video ${video._id}: no uploader field`);
        continue;
      }

      // Try to find user by name or channelname
      const user = await User.findOne({
        $or: [
          { name: video.uploader },
          { channelname: video.uploader },
        ],
      });

      if (user) {
        // Update video with user ID instead of name
        await Video.findByIdAndUpdate(video._id, {
          uploader: user._id.toString(), // Store as string for now
        });
        console.log(`✅ Updated video ${video._id}: ${video.videotitle} -> uploader: ${user.name || user.channelname}`);
        updatedCount++;
      } else {
        console.log(`❌ No user found for uploader: ${video.uploader} (video: ${video._id})`);
      }
    }

    console.log(`\n📊 Update complete! Updated ${updatedCount} videos with proper uploader IDs.`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating videos:", error.message);
    process.exit(1);
  }
}

updateVideoUploaders();
