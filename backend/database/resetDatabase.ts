import { Pool, PoolClient } from 'pg';

// データベース接続設定
const dbConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'web_app_db_integration',
  password: 'postgres',
  port: 5432,
};

// SQL文の定義
const dropTablesSql = `
DROP TABLE IF EXISTS micropost_category;
DROP TABLE IF EXISTS micropost;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS "user";
`;

const createTablesSql = `
CREATE TABLE "user" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT false
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
  ('Admin', 'admin@example.com', 'hashed_password_here', true);
`;

const insertUsersSql = `
INSERT INTO public."user" (name, email, password_hash, is_admin) VALUES 
  ('Alice', 'alice@example.com', 'hashed_password_here', false),
  ('Bob', 'bob@example.com', 'hashed_password_here', false),
  ('Charlie', 'charlie@example.com', 'hashed_password_here', false);
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
  const pool = new Pool(dbConfig);
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
    await setupDatabase();
    console.log('Database setup completed successfully');
  } catch (err) {
    console.error('Database setup failed:', err);
    process.exit(1);
  }
}

// スクリプトの実行
main();