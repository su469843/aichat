export interface Database {
    query(sql: string, params?: unknown[]): Promise<any>;
    execute(sql: string, params?: unknown[]): Promise<{
        rows?: any[];
        changes?: number;
    }>;
    connect?(): Promise<void>;
    close(): Promise<void>;
}
export declare const initializeDatabase: () => Promise<Database>;
export declare const getDatabase: () => Database;
export declare const closeDatabase: () => Promise<void>;
//# sourceMappingURL=db.d.ts.map