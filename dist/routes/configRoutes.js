"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configRoutes = void 0;
/**
 * 配置相关路由
 */
const express_1 = require("express");
const appConfig_1 = __importDefault(require("../config/appConfig"));
exports.configRoutes = (0, express_1.Router)();
// 获取当前配置信息
exports.configRoutes.get('/', (req, res) => {
    res.json({
        mode: appConfig_1.default.modelMode,
        nodeEnv: appConfig_1.default.nodeEnv,
        timestamp: new Date().toISOString(),
    });
});
// 获取模型列表 (仅在环境变量模式下)
exports.configRoutes.get('/models', (req, res) => {
    if (appConfig_1.default.modelMode === 'env') {
        res.json({
            models: [
                {
                    name: appConfig_1.default.env.apiModelName,
                    baseUrl: appConfig_1.default.env.apiBaseUrl,
                    type: 'default',
                },
            ],
        });
    }
    else {
        res.json({
            message: '使用数据库模式，请连接数据库获取模型列表',
        });
    }
});
exports.default = exports.configRoutes;
//# sourceMappingURL=configRoutes.js.map