/**
 * SQLite 数据库实现
 */
import { Database } from './db';
export declare class SqliteDatabase implements Database {
    private dbPath;
    private db;
    constructor(connectionString: string);
    connect(): Promise<void>;
    query(sql: string, params?: unknown[]): Promise<any>;
    execute(sql: string, params?: unknown[]): Promise<{
        rows?: any[];
        changes?: number;
    }>;
    close(): Promise<void>;
}
//# sourceMappingURL=sqlite.d.ts.map