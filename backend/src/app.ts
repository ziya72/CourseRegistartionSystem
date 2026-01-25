import express from "express";
import authRoutes from "./auth/auth.routes";
import exampleRoutes from "./routes/example.routes";

const app = express();

app.use(express.json());

console.log("Mounting routes...");

// Test route
app.get("/test", (req, res) => {
  res.json({ message: "Direct test route works" });
});

// Mount routes
app.use("/auth", authRoutes);
console.log("Auth routes mounted");

app.use("/api", exampleRoutes);
console.log("Example routes mounted");

export default app;
