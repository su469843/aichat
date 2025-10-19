import { Message } from '../types/chat';
export declare class AIService {
    /**
     * 调用AI模型获取回复
     */
    getAIResponse(messages: Message[]): Promise<string>;
    /**
     * 调用环境变量模式的API
     */
    private callEnvModeAPI;
    /**
     * 调用数据库模式的API
     */
    private callDatabaseModeAPI;
}
export declare const aiService: AIService;
export default aiService;
//# sourceMappingURL=aiService.d.ts.map