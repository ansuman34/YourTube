import Download from "../Modals/Download.js";
import User from "../Modals/Auth.js";
import Video from "../Modals/video.js";
import fs from "fs";
import path from "path";

export const downloadVideo = async (req, res) => {
  try {
    const { userId, videoId } = req.body;
    console.log("Download request received - userId:", userId, "videoId:", videoId);

    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }
    console.log("User found:", user._id);

    const video = await Video.findById(videoId);
    if (!video) {
      console.log("Video not found");
      return res.status(404).json({ message: "Video not found" });
    }
    console.log("Video found:", video._id, video.filename);
    
    const today = new Date().toDateString();
    const lastDownloadDate = new Date(user.lastDownloadDate).toDateString();

    if (today !== lastDownloadDate) {
      user.downloadsToday = 0;
      user.lastDownloadDate = new Date();
    }

    if (!user.isPremium && user.downloadsToday >= 10) {
      console.log("Download limit reached for user");
      return res.status(403).json({ message: "Free users can download only 10video per day. Upgrade to premium for unlimited downloads." });
    }

    // Increment download count
    user.downloadsToday += 1;
    await user.save();
    console.log("User updated with download count");

    // Record the download
    const download = new Download({ userId, videoId });
    console.log("Download object created:", download);
    await download.save();
    console.log("Download record saved to database:", download._id);

    // Serve the file
    const filePath = path.join(process.cwd(), video.filepath);
    console.log("Attempting to download file from:", filePath);
    if (!fs.existsSync(filePath)) {
      console.log("File does not exist at path:", filePath);
      return res.status(404).json({ message: "File not found on server" });
    }

    console.log("File exists, starting download");
    res.download(filePath, video.filename, (err) => {
      if (err) {
        console.error("Download error:", err);
        res.status(500).json({ message: "Download failed" });
      } else {
        console.log("Download completed successfully");
      }
    });
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getUserDownloads = async (req, res) => {
  try {
    const { userId } = req.params;
    const downloads = await Download.find({ userId }).populate('videoId');
    res.status(200).json(downloads);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
