"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupErrorHandler = exports.errorHandler = exports.AppError = void 0;
class AppError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
next) => {
    console.error('Error:', err);
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            error: err.message,
        });
    }
    res.status(500).json({
        success: false,
        error: 'Internal server error',
    });
};
exports.errorHandler = errorHandler;
const setupErrorHandler = (app) => {
    app.use(exports.errorHandler);
};
exports.setupErrorHandler = setupErrorHandler;
//# sourceMappingURL=errorHandler.js.map