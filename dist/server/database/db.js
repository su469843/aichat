"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const initializeDatabase = async () => {
    if (dbInstance) {
        return dbInstance;
    }
    const databaseUrl = appConfig_1.default.database.url;
    if (!databaseUrl) {
        throw new Error('DATABASE_URL not set');
    }
    // 根据数据库URL类型初始化
    if (databaseUrl.includes('postgresql')) {
        const PostgresDB = (await Promise.resolve().then(() => __importStar(require('./postgres')))).default;
        dbInstance = new PostgresDB(databaseUrl);
    }
    else if (databaseUrl.includes('mysql') || databaseUrl.includes('mariadb')) {
        const MySQLDB = (await Promise.resolve().then(() => __importStar(require('./mysql')))).default;
        dbInstance = new MySQLDB(databaseUrl);
    }
    else {
        const SQLiteDB = (await Promise.resolve().then(() => __importStar(require('./sqlite')))).default;
        dbInstance = new SQLiteDB(databaseUrl);
    }
    if (dbInstance.connect) {
        await dbInstance.connect();
    }
    return dbInstance;
};
exports.initializeDatabase = initializeDatabase;
const getDatabase = () => {
    if (!dbInstance) {
        throw new Error('Database not initialized');
    }
    return dbInstance;
};
exports.getDatabase = getDatabase;
const closeDatabase = async () => {
    if (dbInstance) {
        await dbInstance.close();
        dbInstance = null;
    }
};
exports.closeDatabase = closeDatabase;
//# sourceMappingURL=db.js.map