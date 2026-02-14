"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenBlacklist = exports.resetTokenStore = exports.otpVerified = exports.otpStore = void 0;
exports.extractEnrollmentNo = extractEnrollmentNo;
exports.isInstitutionalEmail = isInstitutionalEmail;
exports.generateOtp = generateOtp;
exports.isOtpExpired = isOtpExpired;
exports.canAttemptOtp = canAttemptOtp;
exports.incrementOtpAttempts = incrementOtpAttempts;
exports.getRemainingAttempts = getRemainingAttempts;
exports.getOtpExpiryTime = getOtpExpiryTime;
exports.formatTimeRemaining = formatTimeRemaining;
exports.logOtpToConsole = logOtpToConsole;
exports.generateResetToken = generateResetToken;
exports.isResetTokenExpired = isResetTokenExpired;
exports.canAttemptResetToken = canAttemptResetToken;
exports.incrementResetTokenAttempts = incrementResetTokenAttempts;
exports.getRemainingResetAttempts = getRemainingResetAttempts;
exports.getResetTokenExpiryTime = getResetTokenExpiryTime;
exports.logResetTokenToConsole = logResetTokenToConsole;
exports.addToBlacklist = addToBlacklist;
exports.isTokenBlacklisted = isTokenBlacklisted;
exports.extractTokenFromHeader = extractTokenFromHeader;
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
exports.generateAccessToken = generateAccessToken;
exports.generateRefreshToken = generateRefreshToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
/* ================= JWT CONFIG ================= */
const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";
/* ================= OTP CONFIG ================= */
const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || "5");
const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || "3");
/* ================= PASSWORD RESET CONFIG ================= */
const RESET_TOKEN_EXPIRY_MINUTES = parseInt(process.env.RESET_TOKEN_EXPIRY_MINUTES || "15");
const RESET_TOKEN_MAX_ATTEMPTS = parseInt(process.env.RESET_TOKEN_MAX_ATTEMPTS || "3");
/* ================= OTP STORES ================= */
exports.otpStore = new Map();
exports.otpVerified = new Set();
/* ================= PASSWORD RESET STORES ================= */
exports.resetTokenStore = new Map();
/* ================= TOKEN BLACKLIST (for logout) ================= */
exports.tokenBlacklist = new Set();
/* ================= EMAIL & ID HELPERS ================= */
function extractEnrollmentNo(email) {
    return email.split("@")[0];
}
function isInstitutionalEmail(email) {
    return (email.endsWith("@amu.ac.in") ||
        email.endsWith("@myamu.ac.in"));
}
/* ================= OTP HELPERS ================= */
function generateOtp() {
    // Generate random 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
}
function isOtpExpired(otpData) {
    return new Date() > otpData.expiresAt;
}
function canAttemptOtp(otpData) {
    return otpData.attempts < OTP_MAX_ATTEMPTS;
}
function incrementOtpAttempts(email) {
    const otpData = exports.otpStore.get(email);
    if (otpData) {
        otpData.attempts += 1;
        exports.otpStore.set(email, otpData);
    }
}
function getRemainingAttempts(otpData) {
    return OTP_MAX_ATTEMPTS - otpData.attempts;
}
function getOtpExpiryTime() {
    const now = new Date();
    return new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);
}
function formatTimeRemaining(expiresAt) {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    if (diff <= 0)
        return "0s";
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
}
function logOtpToConsole(email, otp, expiresAt) {
    console.log("\n" + "=".repeat(50));
    console.log("🔐 OTP GENERATED");
    console.log("=".repeat(50));
    console.log(`Email:      ${email}`);
    console.log(`OTP:        ${otp}`);
    console.log(`Generated:  ${new Date().toLocaleString()}`);
    console.log(`Expires:    ${expiresAt.toLocaleString()} (${OTP_EXPIRY_MINUTES} minutes)`);
    console.log(`Attempts:   0/${OTP_MAX_ATTEMPTS}`);
    console.log("=".repeat(50) + "\n");
}
/* ================= PASSWORD RESET HELPERS ================= */
function generateResetToken() {
    // Generate random 6-digit reset token
    return Math.floor(100000 + Math.random() * 900000).toString();
}
function isResetTokenExpired(tokenData) {
    return new Date() > tokenData.expiresAt;
}
function canAttemptResetToken(tokenData) {
    return tokenData.attempts < RESET_TOKEN_MAX_ATTEMPTS;
}
function incrementResetTokenAttempts(email) {
    const tokenData = exports.resetTokenStore.get(email);
    if (tokenData) {
        tokenData.attempts += 1;
        exports.resetTokenStore.set(email, tokenData);
    }
}
function getRemainingResetAttempts(tokenData) {
    return RESET_TOKEN_MAX_ATTEMPTS - tokenData.attempts;
}
function getResetTokenExpiryTime() {
    const now = new Date();
    return new Date(now.getTime() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000);
}
function logResetTokenToConsole(email, token, expiresAt) {
    console.log("\n" + "=".repeat(50));
    console.log("🔑 PASSWORD RESET TOKEN GENERATED");
    console.log("=".repeat(50));
    console.log(`Email:      ${email}`);
    console.log(`Token:      ${token}`);
    console.log(`Generated:  ${new Date().toLocaleString()}`);
    console.log(`Expires:    ${expiresAt.toLocaleString()} (${RESET_TOKEN_EXPIRY_MINUTES} minutes)`);
    console.log(`Attempts:   0/${RESET_TOKEN_MAX_ATTEMPTS}`);
    console.log("=".repeat(50) + "\n");
}
/* ================= TOKEN BLACKLIST HELPERS ================= */
function addToBlacklist(token) {
    exports.tokenBlacklist.add(token);
}
function isTokenBlacklisted(token) {
    return exports.tokenBlacklist.has(token);
}
function extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }
    return authHeader.substring(7);
}
/* ================= PASSWORD HELPERS ================= */
function hashPassword(password) {
    return bcrypt_1.default.hash(password, 10);
}
function comparePassword(password, hash) {
    return bcrypt_1.default.compare(password, hash);
}
/* ================= TOKEN HELPERS ================= */
function generateAccessToken(payload) {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRY,
    });
}
function generateRefreshToken(payload, rememberMe) {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
        expiresIn: rememberMe ? "30d" : REFRESH_TOKEN_EXPIRY,
    });
}
