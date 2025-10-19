"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqliteDatabase = void 0;
class SqliteDatabase {
    constructor(connectionString) {
        // 从 sqlite:///path/to/db.db 提取路径
        this.dbPath = connectionString.replace('sqlite:///', '');
    }
    async connect() {
        try {
            // 动态导入 better-sqlite3 或 sql.js（需要在 package.json 中安装）
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const DatabaseModule = require('better-sqlite3');
            const Database = DatabaseModule.default || DatabaseModule;
            this.db = new Database(this.dbPath);
            console.log('✅ SQLite 连接成功');
        }
        catch (error) {
            console.error('❌ SQLite 连接失败:', error);
            throw error;
        }
    }
    async query(sql, params) {
        try {
            const stmt = this.db.prepare(sql);
            if (params && params.length > 0) {
                return stmt.all(...params);
            }
            return stmt.all();
        }
        catch (error) {
            console.error('查询失败:', error);
            throw error;
        }
    }
    async execute(sql, params) {
        try {
            const stmt = this.db.prepare(sql);
            if (params && params.length > 0) {
                const info = stmt.run(...params);
                return {
                    changes: info.changes,
                };
            }
            const info = stmt.run();
            return {
                changes: info.changes,
            };
        }
        catch (error) {
            console.error('执行失败:', error);
            throw error;
        }
    }
    async close() {
        if (this.db) {
            this.db.close();
            console.log('✅ SQLite 连接已关闭');
        }
    }
}
exports.SqliteDatabase = SqliteDatabase;
//# sourceMappingURL=sqlite.js.map