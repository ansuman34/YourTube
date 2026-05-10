import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userroutes from "./routes/auth.js";
import videoroutes from "./routes/video.js";
import likeroutes from "./routes/like.js";
import watchlaterroutes from "./routes/watchlater.js";
import historyrroutes from "./routes/history.js";
import commentroutes from "./routes/comment.js";
import downloadroutes from "./routes/download.js";
import premiumroutes from "./routes/premium.js";
import subscriptionroutes from "./routes/subscription.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use("/uploads", express.static(uploadsDir));
app.get("/", (req, res) => {
  res.send("You tube backend is working");
});
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});
app.use("/user", userroutes);
app.use("/video", videoroutes);
app.use("/like", likeroutes);
app.use("/watch", watchlaterroutes);
app.use("/history", historyrroutes);
app.use("/comment", commentroutes);
app.use("/download", downloadroutes);
app.use("/premium", premiumroutes);
app.use("/subscription", subscriptionroutes);
const PORT = process.env.PORT || 5000;

const DBURL = process.env.DB_URL;
if (!DBURL) {
  console.error("DB_URL is not configured");
  process.exit(1);
}

const mongoOptions = {
  serverSelectionTimeoutMS: 15000,
};

try {
  const parsedDbUrl = new URL(DBURL);
  const databaseName = parsedDbUrl.pathname.replace(/^\//, "");
  const hasAuthSource = parsedDbUrl.searchParams.has("authSource");

  if (databaseName) {
    mongoOptions.dbName = databaseName;
  }

  if (!hasAuthSource) {
    mongoOptions.authSource = "admin";
  }
} catch {
  console.error("DB_URL is not a valid MongoDB URI");
  process.exit(1);
}

mongoose
  .connect(DBURL, mongoOptions)
  .then(() => {
    console.log("Mongodb connected");
    app.listen(PORT, () => {
      console.log(`server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    if (error?.codeName === "AtlasError" || error?.code === 8000) {
      console.error(
        "Atlas rejected DB_URL credentials. Check the username/password in server/.env, make sure the database user exists in Atlas Database Access, and URL-encode any special characters in the password."
      );
    }
    process.exit(1);
  });
