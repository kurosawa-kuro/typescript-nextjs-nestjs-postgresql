import { Pool } from 'pg';
import * as dotenv from 'dotenv';

export class DatabaseConfig {
  private static pool: Pool;

  static getPool(): Pool {
    if (!this.pool) {
      // 環境変数の読み込み
      dotenv.config();

      const dbName =
        process.env.NODE_ENV === 'test'
          ? 'web_app_db_integration_test'
          : process.env.DB_NAME || 'web_app_db_development';

      // 今どの環境で動いているかを確認
      console.log('process.env.NODE_ENV:', process.env.NODE_ENV);
      this.pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: dbName,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT, 10),
      });

      // エラーハンドリング
      this.pool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
        process.exit(-1);
      });
    }
    return this.pool;
  }

  // テスト用のメソッド
  static async closePool(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }
}
