"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuthMiddleware = exports.adminMiddleware = exports.authMiddleware = void 0;
const authService_1 = __importDefault(require("../services/authService"));
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        res.status(401).json({ success: false, error: 'No token provided' });
        return;
    }
    const payload = authService_1.default.verifyToken(token);
    if (!payload) {
        res.status(401).json({ success: false, error: 'Invalid token' });
        return;
    }
    req.user = payload;
    next();
};
exports.authMiddleware = authMiddleware;
const adminMiddleware = (req, res, next) => {
    if (!req.user?.isAdmin) {
        res.status(403).json({ success: false, error: 'Admin access required' });
        return;
    }
    next();
};
exports.adminMiddleware = adminMiddleware;
const optionalAuthMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        const payload = authService_1.default.verifyToken(token);
        if (payload) {
            req.user = payload;
        }
    }
    next();
};
exports.optionalAuthMiddleware = optionalAuthMiddleware;
//# sourceMappingURL=auth.js.map