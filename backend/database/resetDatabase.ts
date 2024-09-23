import { Pool, PoolClient } from 'pg';

// 環境設定
type Environment = 'development' | 'test';
let env: Environment = 'development';  // デフォルト値

// 環境を切り替える関数
function setEnvironment(newEnv: Environment): void {
  env = newEnv;
  console.log(`Environment set to: ${env}`);
}

// データベース接続設定を取得する関数
function getDbConfig() {
  return {
    user: 'postgres',
    host: 'localhost',
    database: env === 'development' ? 'web_app_db_integration' : 'web_app_db_integration_test',
    password: 'postgres',
    port: 5432,
  };
}

// SQL文の定義
const dropTablesSql = `
DROP TABLE IF EXISTS micropost_category;
DROP TABLE IF EXISTS micropost;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS "user";
`;

const createTablesSql = `
CREATE TABLE IF NOT EXISTS "user" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_admin BOOLEAN DEFAULT false
);

CREATE TABLE micropost (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  image_path VARCHAR(255)
);

CREATE TABLE category (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL
);

CREATE TABLE micropost_category (
  micropost_id INTEGER REFERENCES micropost(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES category(id) ON DELETE CASCADE,
  PRIMARY KEY (micropost_id, category_id)
);
`;

const insertAdminSql = `
INSERT INTO public."user" (name, email, password_hash, is_admin) VALUES 
  ('Admin', 'admin@example.com', '$2b$10$A/JMxdiDKWmpxOc3nBBkVeYiCL9uUrIVWpNohuTP4gKaD/1TGXJt6', true);
`;

const insertUsersSql = `
INSERT INTO public."user" (name, email, password_hash, is_admin) VALUES 
  ('Alice', 'alice@example.com', '$2b$10$A/JMxdiDKWmpxOc3nBBkVeYiCL9uUrIVWpNohuTP4gKaD/1TGXJt6', false),
  ('Bob', 'bob@example.com', '$2b$10$A/JMxdiDKWmpxOc3nBBkVeYiCL9uUrIVWpNohuTP4gKaD/1TGXJt6', false),
  ('Charlie', 'charlie@example.com', '$2b$10$A/JMxdiDKWmpxOc3nBBkVeYiCL9uUrIVWpNohuTP4gKaD/1TGXJt6', false);
`;

const insertOtherDataSql = `
INSERT INTO category (title) VALUES
  ('Technology'),
  ('Science'),
  ('Art');

INSERT INTO micropost (user_id, title) VALUES
  (2, 'Alice''s first post'),
  (2, 'Alice''s second post'),
  (3, 'Bob''s post'),
  (4, 'Charlie''s post');

INSERT INTO micropost_category (micropost_id, category_id) VALUES
  (1, 1),
  (1, 2),
  (2, 3),
  (3, 1),
  (4, 3);
`;

// データベース接続を管理する関数
async function withConnection<T>(operation: (client: PoolClient) => Promise<T>): Promise<T> {
  const pool = new Pool(getDbConfig());
  const client = await pool.connect();
  try {
    return await operation(client);
  } finally {
    client.release();
    await pool.end();
  }
}

// SQLを実行する関数
async function executeSql(client: PoolClient, sql: string, description: string): Promise<void> {
  try {
    await client.query(sql);
    console.log(`${description} completed successfully`);
  } catch (err) {
    console.error(`Error executing ${description}:`, err);
    throw err;
  }
}

// データベースのセットアップを行う関数
async function setupDatabase(): Promise<void> {
  await withConnection(async (client) => {
    await executeSql(client, dropTablesSql, 'Dropping tables');
    await executeSql(client, createTablesSql, 'Creating tables');
    await executeSql(client, insertAdminSql, 'Inserting admin user');
    await executeSql(client, insertUsersSql, 'Inserting regular users');
    await executeSql(client, insertOtherDataSql, 'Inserting other data');
  });
}

// メイン実行関数
async function main(): Promise<void> {
  try {
    console.log(`Setting up database for ${env} environment`);
    console.log(`Using database: ${getDbConfig().database}`);
    await setupDatabase();
    console.log(`Database setup completed successfully for ${env} environment`);
  } catch (err) {
    console.error(`Database setup failed for ${env} environment:`, err);
    process.exit(1);
  }
}

// 使用例
// setEnvironment('test');  // テスト環境に切り替える場合はこの行のコメントを解除
main();