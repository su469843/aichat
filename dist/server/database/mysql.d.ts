/**
 * MySQL数据库实现
 */
import { Database } from './db';
declare class MySQLDB implements Database {
    private url;
    constructor(url: string);
    connect(): Promise<void>;
    query(sql: string, params?: unknown[]): Promise<any>;
    execute(sql: string, params?: unknown[]): Promise<{
        rows?: any[];
        changes?: number;
    }>;
    close(): Promise<void>;
}
export default MySQLDB;
//# sourceMappingURL=mysql.d.ts.map