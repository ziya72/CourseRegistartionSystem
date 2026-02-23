"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_utils_1 = require("./auth.utils");
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
class AuthService {
    static async requestOtp(email) {
        console.log("ð DEBUG: requestOtp called with email:", email);
        if (!(0, auth_utils_1.isInstitutionalEmail)(email)) {
            throw new Error("Invalid institutional email");
        }
        const enrollmentNo = (0, auth_utils_1.extractEnrollmentNo)(email);
        const student = await prisma.student.findUnique({
            where: { enrollment_no: enrollmentNo },
        });
        if (!student) {
            throw new Error("Student record not found");
        }
        // Check if OTP already exists and hasn't expired
        const existingOtp = auth_utils_1.otpStore.get(email);
        if (existingOtp && !(0, auth_utils_1.isOtpExpired)(existingOtp)) {
            const timeRemaining = (0, auth_utils_1.formatTimeRemaining)(existingOtp.expiresAt);
            throw new Error(`OTP already sent. Please wait ${timeRemaining} before requesting a new one.`);
        }
        // Generate new OTP
        const otp = (0, auth_utils_1.generateOtp)();
        const expiresAt = (0, auth_utils_1.getOtpExpiryTime)();
        // Store OTP with metadata
        auth_utils_1.otpStore.set(email, {
            otp,
            expiresAt,
            attempts: 0,
            createdAt: new Date(),
        });
        // Log OTP to console
        (0, auth_utils_1.logOtpToConsole)(email, otp, expiresAt);
        return { message: "OTP sent (check console)" };
    }
    static async verifyOtp(email, otp) {
        const otpData = auth_utils_1.otpStore.get(email);
        // Check if OTP exists
        if (!otpData) {
            throw new Error("OTP not found. Please request an OTP first.");
        }
        // Check if OTP expired
        if ((0, auth_utils_1.isOtpExpired)(otpData)) {
            auth_utils_1.otpStore.delete(email); // Clean up expired OTP
            throw new Error("OTP expired. Please request a new one.");
        }
        // Check if max attempts exceeded
        if (!(0, auth_utils_1.canAttemptOtp)(otpData)) {
            throw new Error("Maximum verification attempts exceeded. Please wait for OTP to expire and request a new one.");
        }
        // Verify OTP
        if (otpData.otp !== otp) {
            (0, auth_utils_1.incrementOtpAttempts)(email);
            const remaining = (0, auth_utils_1.getRemainingAttempts)(otpData);
            throw new Error(`Invalid OTP. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`);
        }
        // OTP verified successfully
        auth_utils_1.otpVerified.add(email);
        auth_utils_1.otpStore.delete(email); // Clear OTP after successful verification
        return { message: "OTP verified" };
    }
    static async signup(email, password) {
        if (!auth_utils_1.otpVerified.has(email)) {
            throw new Error("OTP verification required");
        }
        const enrollmentNo = (0, auth_utils_1.extractEnrollmentNo)(email);
        const student = await prisma.student.findUnique({
            where: { enrollment_no: enrollmentNo },
        });
        if (!student) {
            throw new Error("Student record not found");
        }
        if (student.password_hash) {
            throw new Error("Account already activated");
        }
throw new Error(`Invalid OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`);
        await prisma.student.update({
            where: { enrollment_no: enrollmentNo },
            data: {
                password_hash: hashedPassword,
                is_active: true, // Activate when password is set
            },
        });
        auth_utils_1.otpVerified.delete(email);
        const token = jsonwebtoken_1.default.sign({ enrollmentNo, role: "student" }, JWT_SECRET, { expiresIn: "1h" });
        return {
            token,
            user: {
                id: student.enrollment_no,
                name: student.name,
                email: student.email,
                role: "student",
            },
        };
    }
    static async signin(email, password, rememberMe = false) {
        // Check if it's a TEACHER first (pre-created by admin)
        const teacher = await prisma.teacher.findUnique({
            where: { email },
        });
        if (teacher) {
            if (!teacher.password_hash || !teacher.is_active) {
                throw new Error("Invalid credentials");
            }
            const match = await bcrypt_1.default.compare(password, teacher.password_hash);
            if (!match) {
                throw new Error("Invalid credentials");
            }
            const token = jsonwebtoken_1.default.sign({ teacherId: teacher.teacher_id, role: teacher.role }, JWT_SECRET, { expiresIn: rememberMe ? "7d" : "1h" });
            return {
                token,
                user: {
                    id: teacher.teacher_id.toString(),
                    name: teacher.name,
                    email: teacher.email,
                    role: teacher.role,
                },
            };
        }
        // Otherwise, try STUDENT LOGIN
        if ((0, auth_utils_1.isInstitutionalEmail)(email)) {
            const enrollmentNo = (0, auth_utils_1.extractEnrollmentNo)(email);
            const student = await prisma.student.findUnique({
                where: { enrollment_no: enrollmentNo },
            });
            if (!student || !student.password_hash || !student.is_active) {
                throw new Error("Invalid credentials");
            }
            const match = await bcrypt_1.default.compare(password, student.password_hash);
            if (!match) {
                throw new Error("Invalid credentials");
            }
            const token = jsonwebtoken_1.default.sign({ enrollmentNo, role: "student" }, JWT_SECRET, { expiresIn: rememberMe ? "7d" : "1h" });
            return {
                token,
                user: {
                    id: student.enrollment_no,
                    name: student.name,
                    email: student.email,
                    role: "student",
                },
            };
        }
        throw new Error("Invalid credentials");
    }
    /* ================= FORGOT PASSWORD ================= */
    static async forgotPassword(email) {
        // Check if it's a student or teacher
        let userExists = false;
        // Check student
        if ((0, auth_utils_1.isInstitutionalEmail)(email)) {
            const enrollmentNo = (0, auth_utils_1.extractEnrollmentNo)(email);
            const student = await prisma.student.findUnique({
                where: { enrollment_no: enrollmentNo },
            });
            userExists = !!student;
        }
        else {
            // Check teacher
            const teacher = await prisma.teacher.findUnique({
                where: { email },
            });
            userExists = !!teacher;
        }
        if (!userExists) {
            throw new Error("User not found");
        }
        // Check if reset token already exists and hasn't expired
        const existingToken = auth_utils_1.resetTokenStore.get(email);
        if (existingToken && !(0, auth_utils_1.isResetTokenExpired)(existingToken)) {
            const timeRemaining = (0, auth_utils_1.formatTimeRemaining)(existingToken.expiresAt);
            throw new Error(`Password reset token already sent. Please wait ${timeRemaining} before requesting a new one.`);
        }
        // Generate reset token
        const token = (0, auth_utils_1.generateResetToken)();
        const expiresAt = (0, auth_utils_1.getResetTokenExpiryTime)();
        // Store reset token
        auth_utils_1.resetTokenStore.set(email, {
            token,
            expiresAt,
            attempts: 0,
            createdAt: new Date(),
        });
        // Log token to console
        (0, auth_utils_1.logResetTokenToConsole)(email, token, expiresAt);
        return { message: "Password reset token sent (check console)" };
    }
    static async resetPassword(email, token, newPassword) {
        const tokenData = auth_utils_1.resetTokenStore.get(email);
        // Check if token exists
        if (!tokenData) {
            throw new Error("Reset token not found. Please request a password reset first.");
        }
        // Check if token expired
        if ((0, auth_utils_1.isResetTokenExpired)(tokenData)) {
            auth_utils_1.resetTokenStore.delete(email);
            throw new Error("Reset token expired. Please request a new one.");
        }
        // Check if max attempts exceeded
        if (!(0, auth_utils_1.canAttemptResetToken)(tokenData)) {
            throw new Error("Maximum verification attempts exceeded. Please wait for token to expire and request a new one.");
        }
        // Verify token
        if (tokenData.token !== token) {
            (0, auth_utils_1.incrementResetTokenAttempts)(email);
            const remaining = (0, auth_utils_1.getRemainingResetAttempts)(tokenData);
            throw new Error(`Invalid reset token. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`);
        }
        // Token verified, update password
        const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
        // Update student or teacher password
        if ((0, auth_utils_1.isInstitutionalEmail)(email)) {
            const enrollmentNo = (0, auth_utils_1.extractEnrollmentNo)(email);
            await prisma.student.update({
                where: { enrollment_no: enrollmentNo },
                data: { password_hash: hashedPassword },
            });
        }
        else {
            await prisma.teacher.update({
                where: { email },
                data: { password_hash: hashedPassword },
            });
        }
        // Clear reset token
        auth_utils_1.resetTokenStore.delete(email);
        return { message: "Password reset successfully" };
    }
    /* ================= LOGOUT ================= */
    static async logout(token) {
        // Add token to blacklist
        (0, auth_utils_1.addToBlacklist)(token);
        return { message: "Logged out successfully" };
    }
}
exports.AuthService = AuthService;
