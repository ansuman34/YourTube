import video from "../Modals/video.js";
import mongoose from "mongoose";

export const uploadvideo = async (req, res) => {
  if (req.file === undefined) {
    return res
      .status(400)
      .json({ message: "Please upload an MP4 video file." });
  } else {
    try {
      const normalizedPath = `uploads/${req.file.filename}`;

      const file = new video({
        videotitle: req.body.videotitle,
        description: req.body.description || "",
        category: req.body.category || "Uncategorized",
        filename: req.file.filename,
        filepath: normalizedPath,
        filetype: req.file.mimetype,
        filesize: req.file.size,
        videochanel: req.body.videochanel,
        uploader: req.body.uploader,
      });

      const savedVideo = await file.save();
      return res.status(201).json({ message: "file uploaded successfully", video: savedVideo });
    } catch (error) {
      console.error("Upload error:", error);
      return res.status(500).json({ message: "Something went wrong", error: error.message });
    }
  }
};
export const getallvideo = async (req, res) => {
  try {
    const files = await video.find().sort({ createdAt: -1 });
    return res.status(200).send(files);
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getvideo = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid video id" });
  }

  try {
    const file = await video.findById(id);
    if (!file) {
      return res.status(404).json({ message: "Video not found" });
    }
    return res.status(200).json(file);
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
