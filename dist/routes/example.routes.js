"use strict";
// src/routes/example.routes.ts
// Example routes demonstrating auth middleware usage
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
console.log("Example router created");
/* ================= PUBLIC ROUTES ================= */
router.get("/public", (req, res) => {
    res.json({ message: "This is a public route, no authentication required" });
});
/* ================= AUTHENTICATED ROUTES ================= */
router.get("/protected", auth_middleware_1.authenticate, (req, res) => {
    res.json({
        message: "You are authenticated!",
        user: req.user,
    });
});
/* ================= STUDENT ROUTES ================= */
router.get("/student/dashboard", auth_middleware_1.authenticate, auth_middleware_1.studentOnly, async (req, res) => {
    try {
        const enrollmentNo = req.user.enrollmentNo;
        // Fetch student data from database
        const { PrismaClient } = await Promise.resolve().then(() => __importStar(require("@prisma/client")));
        const prisma = new PrismaClient();
        const student = await prisma.student.findUnique({
            where: { enrollment_no: enrollmentNo },
            include: {
                faculty: true,
            },
        });
        if (!student) {
            res.status(404).json({ error: "Student not found" });
            return;
        }
        // Return data in format expected by frontend
        res.json({
            name: student.name,
            email: student.email,
            enrollmentNo: student.enrollment_no,
            branch: student.faculty?.branch_name || "Computer Engineering",
            admissionYear: student.faculty?.admission_year || 2024,
            cpi: Number(student.current_cpi) || 0.0,
            totalCredits: 0, // TODO: Calculate from enrolled courses
            currentSemester: student.current_semester,
            courses: [], // TODO: Fetch enrolled courses
        });
        await prisma.$disconnect();
    }
    catch (error) {
        console.error("Dashboard error:", error);
        res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
});
router.get("/student/my-courses", auth_middleware_1.authenticate, auth_middleware_1.studentOnly, (req, res) => {
    res.json({
        message: "Your courses",
        enrollmentNo: req.user.enrollmentNo,
        courses: ["CS101", "MA101", "HS101"], // Example data
    });
});
/* ================= TEACHER ROUTES ================= */
router.get("/teacher/dashboard", auth_middleware_1.authenticate, auth_middleware_1.teacherOnly, async (req, res) => {
    try {
        const teacherId = req.user.teacherId;
        // Fetch teacher data from database
        const { PrismaClient } = await Promise.resolve().then(() => __importStar(require("@prisma/client")));
        const prisma = new PrismaClient();
        const teacher = await prisma.teacher.findUnique({
            where: { teacher_id: teacherId },
        });
        if (!teacher) {
            res.status(404).json({ error: "Teacher not found" });
            return;
        }
        // Return teacher dashboard data
        res.json({
            name: teacher.name,
            email: teacher.email,
            teacherId: teacher.teacher_id,
            department: teacher.department,
            role: teacher.role,
            message: "Teacher dashboard loaded successfully",
        });
        await prisma.$disconnect();
    }
    catch (error) {
        console.error("Teacher dashboard error:", error);
        res.status(500).json({ error: "Failed to fetch teacher dashboard data" });
    }
});
router.get("/teacher/students", auth_middleware_1.authenticate, auth_middleware_1.teacherOnly, (req, res) => {
    res.json({
        message: "All students list",
        role: req.user.role,
        students: ["gm0001", "gq5012", "gm7605"], // Example data
    });
});
router.post("/teacher/upload-grades", auth_middleware_1.authenticate, auth_middleware_1.teacherOnly, (req, res) => {
    res.json({
        message: "Grades uploaded successfully",
        uploadedBy: req.user.teacherId,
        role: req.user.role,
    });
});
/* ================= ADMIN ROUTES ================= */
router.get("/admin/dashboard", auth_middleware_1.authenticate, auth_middleware_1.adminOnly, (req, res) => {
    res.json({
        message: "Admin dashboard (only admins)",
        teacherId: req.user.teacherId,
        role: req.user.role,
    });
});
router.post("/admin/create-teacher", auth_middleware_1.authenticate, auth_middleware_1.adminOnly, (req, res) => {
    res.json({
        message: "Teacher account created",
        createdBy: req.user.teacherId,
    });
});
router.delete("/admin/delete-user/:userId", auth_middleware_1.authenticate, auth_middleware_1.adminOnly, (req, res) => {
    res.json({
        message: `User ${req.params.userId} deleted`,
        deletedBy: req.user.teacherId,
    });
});
/* ================= FLEXIBLE AUTHORIZATION ================= */
router.get("/dashboard", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["student", "teacher", "admin"]), (req, res) => {
    res.json({
        message: "Universal dashboard (any authenticated user)",
        user: req.user,
    });
});
router.get("/reports", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(["teacher", "admin"]), (req, res) => {
    res.json({
        message: "Reports (teachers and admins only)",
        user: req.user,
    });
});
/* ================= OWNER OR ADMIN ROUTES ================= */
router.get("/student/:enrollmentNo/profile", auth_middleware_1.authenticate, auth_middleware_1.ownerOrAdmin, (req, res) => {
    res.json({
        message: "Student profile",
        enrollmentNo: req.params.enrollmentNo,
        accessedBy: req.user,
    });
});
router.get("/student/:enrollmentNo/grades", auth_middleware_1.authenticate, auth_middleware_1.ownerOrAdmin, (req, res) => {
    res.json({
        message: "Student grades",
        enrollmentNo: req.params.enrollmentNo,
        grades: { CS101: "A", MA101: "B+", HS101: "A-" }, // Example data
        accessedBy: req.user,
    });
});
exports.default = router;
