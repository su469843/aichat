import { ChatSession } from '../types/chat';
export declare class SessionRepository {
    /**
     * 创建新的聊天会话
     */
    createSession(userId?: number, title?: string): Promise<string>;
    /**
     * 获取聊天会话
     */
    getSession(sessionId: string): Promise<ChatSession | null>;
    /**
     * 获取用户的所有会话
     */
    getUserSessions(userId: number): Promise<ChatSession[]>;
    /**
     * 更新会话标题
     */
    updateSessionTitle(sessionId: string, title: string): Promise<void>;
    /**
     * 删除会话（同时删除所有消息）
     */
    deleteSession(sessionId: string): Promise<void>;
}
export declare const sessionRepository: SessionRepository;
//# sourceMappingURL=sessionRepository.d.ts.map