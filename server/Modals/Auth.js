import mongoose from "mongoose";
const userschema = mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String },
  channelname: { type: String },
  description: { type: String },
  image: { type: String },
  joinedon: { type: Date, default: Date.now },
  isPremium: { type: Boolean, default: false },
  downloadsToday: { type: Number, default: 0 },
  lastDownloadDate: { type: Date, default: Date.now },
});

export default mongoose.model("user", userschema);
