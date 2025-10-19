export interface Database {
    query(sql: string, params?: unknown[]): Promise<any>;
    execute(sql: string, params?: unknown[]): Promise<{
        rows?: any[];
        changes?: number;
    }>;
    connect?(): Promise<void>;
    close(): Promise<void>;
}
/**
 * 初始化数据库
 */
export declare const initializeDatabase: () => Promise<Database>;
/**
 * 获取数据库实例
 */
export declare const getDatabase: () => Database;
/**
 * 关闭数据库连接
 */
export declare const closeDatabase: () => Promise<void>;
//# sourceMappingURL=db.d.ts.map