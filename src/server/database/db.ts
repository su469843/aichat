/**
 * 数据库连接管理
 */
import appConfig from '../config/appConfig';

export interface Database {
  query(sql: string, params?: unknown[]): Promise<any>;
  execute(sql: string, params?: unknown[]): Promise<{ rows?: any[]; changes?: number }>;
  connect?(): Promise<void>;
  close(): Promise<void>;
}

let dbInstance: Database | null = null;

export const initializeDatabase = async (): Promise<Database> => {
  if (dbInstance) {
    return dbInstance;
  }

  const databaseUrl = appConfig.database.url;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL not set');
  }

  // 根据数据库URL类型初始化
  if (databaseUrl.includes('postgresql')) {
    const PostgresDB = (await import('./postgres')).default;
    dbInstance = new PostgresDB(databaseUrl);
  } else if (databaseUrl.includes('mysql') || databaseUrl.includes('mariadb')) {
    const MySQLDB = (await import('./mysql')).default;
    dbInstance = new MySQLDB(databaseUrl);
  } else {
    const SQLiteDB = (await import('./sqlite')).default;
    dbInstance = new SQLiteDB(databaseUrl);
  }

  if (dbInstance.connect) {
    await dbInstance.connect();
  }

  return dbInstance;
};

export const getDatabase = (): Database => {
  if (!dbInstance) {
    throw new Error('Database not initialized');
  }
  return dbInstance;
};

export const closeDatabase = async (): Promise<void> => {
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
  }
};
