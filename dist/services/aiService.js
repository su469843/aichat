"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiService = exports.AIService = void 0;
/**
 * AI模型服务
 * 用于与各种AI模型进行通信
 */
const axios_1 = __importDefault(require("axios"));
const appConfig_1 = __importDefault(require("../config/appConfig"));
class AIService {
    /**
     * 调用AI模型获取回复
     */
    async getAIResponse(messages) {
        try {
            if (appConfig_1.default.modelMode === 'env') {
                return await this.callEnvModeAPI(messages);
            }
            return await this.callDatabaseModeAPI(messages);
        }
        catch (error) {
            console.error('Error calling AI service:', error);
            throw error;
        }
    }
    /**
     * 调用环境变量模式的API
     */
    async callEnvModeAPI(messages) {
        const { apiBaseUrl, apiKey, apiModelName } = appConfig_1.default.env;
        if (!apiBaseUrl || !apiKey || !apiModelName) {
            throw new Error('环境变量模式未正确配置');
        }
        try {
            const response = await axios_1.default.post(`${apiBaseUrl}/chat/completions`, {
                model: apiModelName,
                messages: messages.map((m) => ({
                    role: m.role,
                    content: m.content,
                })),
            }, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data.choices?.[0]?.message?.content || '无法获取回复';
        }
        catch (error) {
            console.error('环境变量模式API调用失败:', error);
            throw error;
        }
    }
    /**
     * 调用数据库模式的API
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async callDatabaseModeAPI(_messages) {
        // 这个方法会在数据库集成时实现
        throw new Error('数据库模式尚未实现');
    }
}
exports.AIService = AIService;
exports.aiService = new AIService();
exports.default = exports.aiService;
//# sourceMappingURL=aiService.js.map