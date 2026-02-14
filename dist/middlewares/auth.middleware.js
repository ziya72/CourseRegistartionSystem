"use strict";
// src/middlewares/auth.middleware.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.authorize = authorize;
exports.studentOnly = studentOnly;
exports.teacherOnly = teacherOnly;
exports.adminOnly = adminOnly;
exports.ownerOrAdmin = ownerOrAdmin;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_utils_1 = require("../auth/auth.utils");
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
/* ================= AUTHENTICATION MIDDLEWARE ================= */
/**
 * Verifies JWT token and attaches user info to request
 * Use this for any protected route
 */
function authenticate(req, res, next) {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }
        const token = authHeader.substring(7); // Remove "Bearer " prefix
        // Check if token is blacklisted (logged out)
        if ((0, auth_utils_1.isTokenBlacklisted)(token)) {
            res.status(401).json({ error: "Token has been revoked" });
            return;
        }
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Attach user info to request
        if ("enrollmentNo" in decoded) {
            // Student token
            req.user = {
                enrollmentNo: decoded.enrollmentNo,
                role: "student",
            };
        }
        else if ("teacherId" in decoded) {
            // Teacher/Admin token
            req.user = {
                teacherId: decoded.teacherId,
                role: decoded.role,
            };
        }
        else {
            res.status(401).json({ error: "Invalid token format" });
            return;
        }
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({ error: "Token expired" });
            return;
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({ error: "Invalid token" });
            return;
        }
        res.status(500).json({ error: "Authentication failed" });
    }
}
/* ================= ROLE-BASED AUTHORIZATION ================= */
/**
 * Role hierarchy:
 * - admin: Can access admin, teacher, and student routes (superset)
 * - teacher: Can access teacher and student routes
 * - student: Can only access student routes
 */
/**
 * Checks if user has required role or higher privilege
 */
function hasRequiredRole(userRole, requiredRole) {
    const roleHierarchy = {
        student: 1,
        teacher: 2,
        admin: 3,
    };
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}
/**
 * Middleware factory for role-based access control
 * @param allowedRoles - Array of roles that can access the route
 *
 * @example
 * // Only students can access
 * router.get('/my-courses', authenticate, authorize(['student']), ...)
 *
 * // Teachers and admins can access
 * router.get('/all-students', authenticate, authorize(['teacher', 'admin']), ...)
 *
 * // Only admins can access
 * router.post('/create-teacher', authenticate, authorize(['admin']), ...)
 */
function authorize(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }
        const userRole = req.user.role;
        // Check if user has any of the allowed roles (considering hierarchy)
        const hasAccess = allowedRoles.some((role) => hasRequiredRole(userRole, role));
        if (!hasAccess) {
            res.status(403).json({
                error: "Access denied",
                message: `This route requires one of the following roles: ${allowedRoles.join(", ")}`,
            });
            return;
        }
        next();
    };
}
/* ================= CONVENIENCE MIDDLEWARE ================= */
/**
 * Ensures only students can access
 * Admin and teachers are NOT allowed
 */
function studentOnly(req, res, next) {
    if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
    }
    if (req.user.role !== "student") {
        res.status(403).json({
            error: "Access denied",
            message: "This route is only accessible to students",
        });
        return;
    }
    next();
}
/**
 * Ensures only teachers can access
 * Admins CAN access (admin is superset of teacher)
 */
function teacherOnly(req, res, next) {
    if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
    }
    if (!hasRequiredRole(req.user.role, "teacher")) {
        res.status(403).json({
            error: "Access denied",
            message: "This route requires teacher or admin privileges",
        });
        return;
    }
    next();
}
/**
 * Ensures only admins can access
 * Teachers and students are NOT allowed
 */
function adminOnly(req, res, next) {
    if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
    }
    if (req.user.role !== "admin") {
        res.status(403).json({
            error: "Access denied",
            message: "This route is only accessible to administrators",
        });
        return;
    }
    next();
}
/**
 * Ensures user can only access their own resources
 * For students: checks enrollmentNo
 * For teachers/admins: allows access to all
 */
function ownerOrAdmin(req, res, next) {
    if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
    }
    // Admins and teachers can access any resource
    if (req.user.role === "admin" || req.user.role === "teacher") {
        next();
        return;
    }
    // Students can only access their own resources
    const enrollmentNo = req.params.enrollmentNo || req.body.enrollmentNo;
    if (!enrollmentNo) {
        res.status(400).json({
            error: "Enrollment number required",
        });
        return;
    }
    if (req.user.enrollmentNo !== enrollmentNo) {
        res.status(403).json({
            error: "Access denied",
            message: "You can only access your own resources",
        });
        return;
    }
    next();
}
