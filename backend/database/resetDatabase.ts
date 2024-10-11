import { Pool, PoolClient } from 'pg';

// 環境設定
export type Environment = 'development' | 'test';
export let env: Environment = 'development';  // デフォルト値

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
DROP TABLE IF EXISTS micropost_category CASCADE;
DROP TABLE IF EXISTS micropost CASCADE;
DROP TABLE IF EXISTS category CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;
DROP SEQUENCE IF EXISTS user_id_seq CASCADE;
DROP SEQUENCE IF EXISTS micropost_id_seq CASCADE;
DROP SEQUENCE IF EXISTS category_id_seq CASCADE;
`;

const createTablesSql = `
CREATE SEQUENCE IF NOT EXISTS user_id_seq;
CREATE TABLE IF NOT EXISTS "user" (
  id INTEGER PRIMARY KEY DEFAULT nextval('user_id_seq'),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  avatar_path VARCHAR(255) DEFAULT 'default_avatar.png'
);
ALTER SEQUENCE user_id_seq OWNED BY "user".id;

CREATE SEQUENCE IF NOT EXISTS micropost_id_seq;
CREATE TABLE IF NOT EXISTS micropost (
  id INTEGER PRIMARY KEY DEFAULT nextval('micropost_id_seq'),
  user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  image_path VARCHAR(255)
);
ALTER SEQUENCE micropost_id_seq OWNED BY micropost.id;

CREATE SEQUENCE IF NOT EXISTS category_id_seq;
CREATE TABLE IF NOT EXISTS category (
  id INTEGER PRIMARY KEY DEFAULT nextval('category_id_seq'),
  title VARCHAR(255) NOT NULL
);
ALTER SEQUENCE category_id_seq OWNED BY category.id;

CREATE TABLE IF NOT EXISTS micropost_category (
  micropost_id INTEGER REFERENCES micropost(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES category(id) ON DELETE CASCADE,
  PRIMARY KEY (micropost_id, category_id)
);
`;

const insertAdminSql = `
INSERT INTO public."user" (name, email, password_hash, is_admin) VALUES 
  ('Admin', 'admin@example.com', '$2b$10$trAqnUDNSyLrcf2SbiLvjOijquaQDRAwQM4IBkWomc5au.OdxuiK.', true);
`;

const insertUsersSql = `
INSERT INTO public."user" (name, email, password_hash, is_admin, avatar_path) VALUES 
  ('Alice', 'alice@example.com', '$2b$10$trAqnUDNSyLrcf2SbiLvjOijquaQDRAwQM4IBkWomc5au.OdxuiK.', false, 'alice_avatar.png'),
  ('Bob', 'bob@example.com', '$2b$10$trAqnUDNSyLrcf2SbiLvjOijquaQDRAwQM4IBkWomc5au.OdxuiK.', false, 'bob_avatar.png'),
  ('Charlie', 'charlie@example.com', '$2b$10$trAqnUDNSyLrcf2SbiLvjOijquaQDRAwQM4IBkWomc5au.OdxuiK.', false, 'charlie_avatar.png');
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
export async function main(): Promise<void> {
  try {
    console.log(`Setting up database for ${env} environment`);
    console.log(`Using database: ${getDbConfig().database}`);
    await setupDatabase();
    console.log(`Database setup completed successfully for ${env} environment`);
  } catch (err) {
    console.error(`Database setup failed for ${env} environment:`, err);
    throw err;
  }
}

// main()を実行する
if (require.main === module) {
  main();
}