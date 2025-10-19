import { Message } from '../types/chat';
export declare class MessageRepository {
    /**
     * 保存消息到数据库
     */
    saveMessage(sessionId: string, role: 'user' | 'assistant', content: string): Promise<string>;
    /**
     * 获取会话的所有消息
     */
    getSessionMessages(sessionId: string): Promise<Message[]>;
    /**
     * 获取指定数量的最新消息
     */
    getLatestMessages(sessionId: string, limit?: number): Promise<Message[]>;
    /**
     * 删除指定消息
     */
    deleteMessage(messageId: string): Promise<void>;
    /**
     * 删除会话的所有消息
     */
    deleteSessionMessages(sessionId: string): Promise<void>;
}
export declare const messageRepository: MessageRepository;
//# sourceMappingURL=messageRepository.d.ts.map