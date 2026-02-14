"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./auth/auth.routes"));
const example_routes_1 = __importDefault(require("./routes/example.routes"));
const course_routes_1 = __importDefault(require("./routes/course.routes"));
const app = (0, express_1.default)();
// CORS Configuration - Allow frontend origin
app.use((0, cors_1.default)({
    origin: "http://localhost:8080",
    credentials: true,
}));
app.use(express_1.default.json());
console.log("Mounting routes...");
// Test route
app.get("/test", (req, res) => {
    res.json({ message: "Direct test route works" });
});
// Mount routes
app.use("/auth", auth_routes_1.default);
console.log("Auth routes mounted at /auth");
app.use("/api/auth", auth_routes_1.default);
console.log("Auth routes mounted at /api/auth (frontend compatibility)");
app.use("/api", example_routes_1.default);
console.log("Example routes mounted at /api");
app.use("/api/courses", course_routes_1.default);
console.log("Course routes mounted at /api/courses");
exports.default = app;
