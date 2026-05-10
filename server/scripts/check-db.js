import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

if (!process.env.DB_URL) {
  console.error("DB_URL is missing from server/.env");
  process.exit(1);
}

let mongoOptions = {
  serverSelectionTimeoutMS: 12000,
};

try {
  const uri = new URL(process.env.DB_URL);
  console.log(`Checking MongoDB connection to ${uri.host}${uri.pathname}`);
  const databaseName = uri.pathname.replace(/^\//, "");
  if (databaseName) {
    mongoOptions.dbName = databaseName;
  }
  if (!uri.searchParams.has("authSource")) {
    mongoOptions.authSource = "admin";
  }
} catch {
  console.error("DB_URL is not a valid MongoDB URI.");
  process.exit(1);
}

try {
  await mongoose.connect(process.env.DB_URL, mongoOptions);
  console.log("MongoDB connected successfully.");
  await mongoose.disconnect();
} catch (error) {
  console.error(`MongoDB connection failed: ${error.message}`);
  if (error?.codeName === "AtlasError" || error?.code === 8000) {
    console.error(
      "Atlas rejected the credentials. Update the username/password in server/.env or reset that database user's password in Atlas."
    );
  }
  process.exit(1);
}
