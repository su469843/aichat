/**
 * 聊天相关的类型定义
 */
export interface Message {
    id?: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: Date;
}
export interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
}
export interface ModelConfig {
    id?: string;
    name: string;
    baseUrl: string;
    apiKey: string;
    modelName: string;
    description?: string;
}
export interface ChatRequest {
    message: string;
    sessionId?: string;
    modelId?: string;
}
export interface ChatResponse {
    success: boolean;
    message: string;
    sessionId?: string;
    data?: any;
    error?: string;
}
//# sourceMappingURL=chat.d.ts.map