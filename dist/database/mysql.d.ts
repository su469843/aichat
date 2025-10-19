/**
 * MySQL 数据库实现
 */
import { Database } from './db';
export declare class MysqlDatabase implements Database {
    private connectionString;
    private connection;
    constructor(connectionString: string);
    connect(): Promise<void>;
    query(sql: string, params?: unknown[]): Promise<any>;
    execute(sql: string, params?: unknown[]): Promise<{
        rows?: any[];
        changes?: number;
    }>;
    close(): Promise<void>;
}
//# sourceMappingURL=mysql.d.ts.map