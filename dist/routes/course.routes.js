"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const course_controller_1 = require("../controllers/course.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Student course routes
router.get("/available", auth_middleware_1.authenticate, auth_middleware_1.studentOnly, course_controller_1.CourseController.getAvailableCourses);
router.post("/register", auth_middleware_1.authenticate, auth_middleware_1.studentOnly, course_controller_1.CourseController.registerCourse);
router.delete("/drop/:courseCode", auth_middleware_1.authenticate, auth_middleware_1.studentOnly, course_controller_1.CourseController.dropCourse);
router.get("/enrolled", auth_middleware_1.authenticate, auth_middleware_1.studentOnly, course_controller_1.CourseController.getEnrolledCourses);
exports.default = router;
