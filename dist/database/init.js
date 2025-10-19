"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeTables = void 0;
/**
 * 数据库初始化脚本
 * 创建所有必要的表和索引
 */
const db_1 = require("./db");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const initializeTables = async () => {
    try {
        const db = (0, db_1.getDatabase)();
        console.log('📋 开始初始化数据库表...');
        // 读取 schemas.sql 文件
        const schemaPath = path_1.default.join(__dirname, 'schemas.sql');
        const schemaSql = fs_1.default.readFileSync(schemaPath, 'utf-8');
        // 对于 SQLite，需要分语句执行
        const statements = schemaSql.split(';').filter((s) => s.trim().length > 0);
        for (const statement of statements) {
            try {
                await db.execute(statement.trim());
            }
            catch (error) {
                // 如果表已存在，忽略错误
                if (!error.message.includes('already exists') && !error.message.includes('duplicate')) {
                    console.warn('警告:', error.message);
                }
            }
        }
        console.log('✅ 数据库表初始化完成');
    }
    catch (error) {
        console.error('❌ 数据库表初始化失败:', error);
        throw error;
    }
};
exports.initializeTables = initializeTables;
//# sourceMappingURL=init.js.map