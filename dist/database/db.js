"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeDatabase = exports.getDatabase = exports.initializeDatabase = void 0;
/**
 * 数据库连接管理
 */
const appConfig_1 = __importDefault(require("../config/appConfig"));
let dbInstance = null;
/**
 * 初始化数据库
 */
const initializeDatabase = async () => {
    if (dbInstance) {
        return dbInstance;
    }
    if (appConfig_1.default.modelMode !== 'database') {
        throw new Error('当前模式不是 database 模式');
    }
    const databaseUrl = appConfig_1.default.database.url;
    if (!databaseUrl) {
        throw new Error('未设置 DATABASE_URL 环境变量');
    }
    try {
        // 这里会根据 DATABASE_URL 的格式自动选择数据库驱动
        // 例如：
        // postgresql://user:password@localhost:5432/dbname
        // mysql://user:password@localhost:3306/dbname
        // sqlite:///./chat.db
        let db = null;
        if (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { PostgresDatabase } = require('./postgres');
            db = new PostgresDatabase(databaseUrl);
        }
        else if (databaseUrl.startsWith('mysql://')) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { MysqlDatabase } = require('./mysql');
            db = new MysqlDatabase(databaseUrl);
        }
        else if (databaseUrl.startsWith('sqlite://')) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { SqliteDatabase } = require('./sqlite');
            db = new SqliteDatabase(databaseUrl);
        }
        else {
            throw new Error(`不支持的数据库 URL: ${databaseUrl}`);
        }
        if (db) {
            await db.connect?.();
            dbInstance = db;
            console.log('✅ 数据库连接成功');
            return dbInstance;
        }
        throw new Error('数据库初始化失败');
    }
    catch (error) {
        console.error('❌ 数据库连接失败:', error);
        throw error;
    }
};
exports.initializeDatabase = initializeDatabase;
/**
 * 获取数据库实例
 */
const getDatabase = () => {
    if (!dbInstance) {
        throw new Error('数据库未初始化，请先调用 initializeDatabase()');
    }
    return dbInstance;
};
exports.getDatabase = getDatabase;
/**
 * 关闭数据库连接
 */
const closeDatabase = async () => {
    if (dbInstance) {
        await dbInstance.close();
        dbInstance = null;
    }
};
exports.closeDatabase = closeDatabase;
//# sourceMappingURL=db.js.map