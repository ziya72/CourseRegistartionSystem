import { Router } from "express";
import { StudentController } from "../controllers/student.controller";
import { authenticate, studentOnly } from "../middlewares/auth.middleware";

const router = Router();

console.log("Student router created");

// Student dashboard
router.get("/dashboard", authenticate, studentOnly, StudentController.getDashboard);

// Course history
router.get("/course-history", authenticate, studentOnly, StudentController.getCourseHistory);

export default router;
