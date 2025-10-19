/**
 * 聊天控制器
 */
import { ChatRequest, ChatResponse } from '../types/chat';
export declare const chatController: {
    /**
     * 发送消息
     */
    sendMessage(request: ChatRequest): Promise<ChatResponse>;
    /**
     * 获取聊天历史
     */
    getChatHistory(sessionId: string): Promise<ChatResponse>;
    /**
     * 创建新会话
     */
    createSession(): Promise<ChatResponse>;
};
export default chatController;
//# sourceMappingURL=chatController.d.ts.map