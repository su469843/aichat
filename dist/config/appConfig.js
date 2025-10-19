"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appConfig = void 0;
/**
 * 应用全局配置文件
 */
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.appConfig = {
    // 服务器配置
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    // 模型配置模式
    modelMode: (process.env.MODEL_MODE || 'env'),
    // 环境变量模式配置
    env: {
        apiModelName: process.env.API_MODEL_NAME || '',
        apiBaseUrl: process.env.API_BASE_URL || '',
        apiKey: process.env.API_KEY || '',
    },
    // 数据库配置
    database: {
        url: process.env.DATABASE_URL || '',
    },
};
exports.default = exports.appConfig;
//# sourceMappingURL=appConfig.js.map