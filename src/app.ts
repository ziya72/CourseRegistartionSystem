import express from "express";
import cors from "cors";
import authRoutes from "./auth/auth.routes";
import exampleRoutes from "./routes/example.routes";

const app = express();

// CORS Configuration - Allow frontend origin
app.use(
  cors({
    origin: "http://localhost:8080",
    credentials: true,
  })
);

app.use(express.json());

console.log("Mounting routes...");

// Test route
app.get("/test", (req, res) => {
  res.json({ message: "Direct test route works" });
});

// Mount routes
app.use("/auth", authRoutes);
console.log("Auth routes mounted at /auth");

app.use("/api/auth", authRoutes);
console.log("Auth routes mounted at /api/auth (frontend compatibility)");

app.use("/api", exampleRoutes);
console.log("Example routes mounted at /api");

export default app;
