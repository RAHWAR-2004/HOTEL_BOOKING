import express from "express";
import "dotenv/config";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from "@clerk/express";
import clerkWebhooks from "./controllers/clerkWebhooks.js";

// Connect to DB
connectDB();

const app = express();
app.use(cors()); // Enable Cross-Origin Resource Sharing

// Middleware
app.use(express.json());
app.use(clerkMiddleware());

// API routes
app.use("/api/clerk", clerkWebhooks);

// Serve frontend build
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "../client/dist")));

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

