"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresDatabase = void 0;
class PostgresDatabase {
    constructor(connectionString) {
        this.connectionString = connectionString;
    }
    async connect() {
        try {
            // 动态导入 pg 模块（需要在 package.json 中安装）
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const pg = require('pg');
            const Client = pg.Client;
            this.client = new Client({
                connectionString: this.connectionString,
            });
            await this.client.connect();
            console.log('✅ PostgreSQL 连接成功');
        }
        catch (error) {
            console.error('❌ PostgreSQL 连接失败:', error);
            throw error;
        }
    }
    async query(sql, params) {
        try {
            const result = await this.client.query(sql, params);
            return result.rows;
        }
        catch (error) {
            console.error('查询失败:', error);
            throw error;
        }
    }
    async execute(sql, params) {
        try {
            const result = await this.client.query(sql, params);
            return {
                rows: result.rows,
                changes: result.rowCount,
            };
        }
        catch (error) {
            console.error('执行失败:', error);
            throw error;
        }
    }
    async close() {
        if (this.client) {
            await this.client.end();
            console.log('✅ PostgreSQL 连接已关闭');
        }
    }
}
exports.PostgresDatabase = PostgresDatabase;
//# sourceMappingURL=postgres.js.map