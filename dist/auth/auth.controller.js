"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const auth_utils_1 = require("./auth.utils");
class AuthController {
    static async requestOtp(req, res) {
        try {
            const { email } = req.body;
            res.json(await auth_service_1.AuthService.requestOtp(email));
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
    static async verifyOtp(req, res) {
        try {
            const { email, otp } = req.body;
            res.json(await auth_service_1.AuthService.verifyOtp(email, otp));
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
    static async signup(req, res) {
        try {
            const { email, password, confirmPassword } = req.body;
            // Validate password confirmation
            if (password !== confirmPassword) {
                res.status(400).json({ error: "Passwords do not match" });
                return;
            }
            res.json(await auth_service_1.AuthService.signup(email, password));
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
    static async signin(req, res) {
        try {
            const { email, password, rememberMe } = req.body;
            res.json(await auth_service_1.AuthService.signin(email, password, rememberMe));
        }
        catch (err) {
            res.status(401).json({ error: err.message });
        }
    }
    static async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            res.json(await auth_service_1.AuthService.forgotPassword(email));
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
    static async resetPassword(req, res) {
        try {
            const { email, token, newPassword, confirmPassword } = req.body;
            // Validate password confirmation
            if (newPassword !== confirmPassword) {
                res.status(400).json({ error: "Passwords do not match" });
                return;
            }
            res.json(await auth_service_1.AuthService.resetPassword(email, token, newPassword));
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
    static async logout(req, res) {
        try {
            const token = (0, auth_utils_1.extractTokenFromHeader)(req.headers.authorization);
            if (!token) {
                res.status(401).json({ error: "No token provided" });
                return;
            }
            res.json(await auth_service_1.AuthService.logout(token));
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
}
exports.AuthController = AuthController;
