// src/routes/example.routes.ts
// Example routes demonstrating auth middleware usage

import { Router, Request, Response } from "express";
import {
  authenticate,
  authorize,
  studentOnly,
  teacherOnly,
  adminOnly,
  ownerOrAdmin,
} from "../middlewares/auth.middleware";

const router = Router();

console.log("Example router created");

/* ================= PUBLIC ROUTES ================= */

router.get("/public", (req: Request, res: Response) => {
  res.json({ message: "This is a public route, no authentication required" });
});

/* ================= AUTHENTICATED ROUTES ================= */

router.get("/protected", authenticate, (req: Request, res: Response) => {
  res.json({
    message: "You are authenticated!",
    user: req.user,
  });
});

/* ================= STUDENT ROUTES ================= */

router.get("/student/dashboard", authenticate, studentOnly, (req: Request, res: Response) => {
  res.json({
    message: "Student dashboard",
    enrollmentNo: req.user!.enrollmentNo,
    role: req.user!.role,
  });
});

router.get("/student/my-courses", authenticate, studentOnly, (req: Request, res: Response) => {
  res.json({
    message: "Your courses",
    enrollmentNo: req.user!.enrollmentNo,
    courses: ["CS101", "MA101", "HS101"], // Example data
  });
});

/* ================= TEACHER ROUTES ================= */

router.get("/teacher/dashboard", authenticate, teacherOnly, (req: Request, res: Response) => {
  res.json({
    message: "Teacher dashboard (accessible by teachers and admins)",
    teacherId: req.user!.teacherId,
    role: req.user!.role,
  });
});

router.get("/teacher/students", authenticate, teacherOnly, (req: Request, res: Response) => {
  res.json({
    message: "All students list",
    role: req.user!.role,
    students: ["gm0001", "gq5012", "gm7605"], // Example data
  });
});

router.post("/teacher/upload-grades", authenticate, teacherOnly, (req: Request, res: Response) => {
  res.json({
    message: "Grades uploaded successfully",
    uploadedBy: req.user!.teacherId,
    role: req.user!.role,
  });
});

/* ================= ADMIN ROUTES ================= */

router.get("/admin/dashboard", authenticate, adminOnly, (req: Request, res: Response) => {
  res.json({
    message: "Admin dashboard (only admins)",
    teacherId: req.user!.teacherId,
    role: req.user!.role,
  });
});

router.post("/admin/create-teacher", authenticate, adminOnly, (req: Request, res: Response) => {
  res.json({
    message: "Teacher account created",
    createdBy: req.user!.teacherId,
  });
});

router.delete("/admin/delete-user/:userId", authenticate, adminOnly, (req: Request, res: Response) => {
  res.json({
    message: `User ${req.params.userId} deleted`,
    deletedBy: req.user!.teacherId,
  });
});

/* ================= FLEXIBLE AUTHORIZATION ================= */

router.get("/dashboard", authenticate, authorize(["student", "teacher", "admin"]), (req: Request, res: Response) => {
  res.json({
    message: "Universal dashboard (any authenticated user)",
    user: req.user,
  });
});

router.get("/reports", authenticate, authorize(["teacher", "admin"]), (req: Request, res: Response) => {
  res.json({
    message: "Reports (teachers and admins only)",
    user: req.user,
  });
});

/* ================= OWNER OR ADMIN ROUTES ================= */

router.get("/student/:enrollmentNo/profile", authenticate, ownerOrAdmin, (req: Request, res: Response) => {
  res.json({
    message: "Student profile",
    enrollmentNo: req.params.enrollmentNo,
    accessedBy: req.user,
  });
});

router.get("/student/:enrollmentNo/grades", authenticate, ownerOrAdmin, (req: Request, res: Response) => {
  res.json({
    message: "Student grades",
    enrollmentNo: req.params.enrollmentNo,
    grades: { CS101: "A", MA101: "B+", HS101: "A-" }, // Example data
    accessedBy: req.user,
  });
});

export default router;
