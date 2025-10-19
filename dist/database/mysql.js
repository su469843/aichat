"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MysqlDatabase = void 0;
class MysqlDatabase {
    constructor(connectionString) {
        this.connectionString = connectionString;
    }
    async connect() {
        try {
            // 动态导入 mysql2 模块（需要在 package.json 中安装）
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const mysql = require('mysql2/promise');
            this.connection = await mysql.createConnection({
                connectionString: this.connectionString,
            });
            console.log('✅ MySQL 连接成功');
        }
        catch (error) {
            console.error('❌ MySQL 连接失败:', error);
            throw error;
        }
    }
    async query(sql, params) {
        try {
            const [rows] = await this.connection.query(sql, params);
            return rows;
        }
        catch (error) {
            console.error('查询失败:', error);
            throw error;
        }
    }
    async execute(sql, params) {
        try {
            const [rows, meta] = await this.connection.query(sql, params);
            return {
                rows,
                changes: meta.affectedRows,
            };
        }
        catch (error) {
            console.error('执行失败:', error);
            throw error;
        }
    }
    async close() {
        if (this.connection) {
            await this.connection.end();
            console.log('✅ MySQL 连接已关闭');
        }
    }
}
exports.MysqlDatabase = MysqlDatabase;
//# sourceMappingURL=mysql.js.map