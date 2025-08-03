import express from "express";
import "dotenv/config";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from "@clerk/express";
import clerkWebhooks from "./controllers/clerkWebhooks.js";

// Connect to DB
connectDB();

const app = express();
app.use(cors()); // Enable CORS
app.use(express.json());

// Clerk middleware (applies to protected endpoints)
app.use(clerkMiddleware());

// API routes
app.use("/api/clerk", clerkWebhooks);

// Serve frontend build
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.join(__dirname, "../client/dist");

app.use(express.static(clientDist));

// Fallback for client-side routing — must come after API mounts
app.get("*", (req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
