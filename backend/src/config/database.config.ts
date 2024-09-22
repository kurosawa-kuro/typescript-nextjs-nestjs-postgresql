import { Pool } from 'pg';
import * as dotenv from 'dotenv';

export class DatabaseConfig {
  private static pool: Pool;

  static getPool(): Pool {
    if (!this.pool) {
      dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });
      
      this.pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT, 10),
      });
    }
    return this.pool;
  }
}