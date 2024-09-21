
.env

```
DB_USER=postgres
DB_HOST=localhost
DB_NAME=web_app_db_integration
DB_PASSWORD=postgres
DB_PORT=5432
```

.env.test

```
DB_USER=postgres
DB_HOST=localhost
DB_NAME=web_app_db_integration_test
DB_PASSWORD=postgres
DB_PORT=5432
```



```
-- ユーザーテーブル
CREATE TABLE "user" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

-- マイクロポストテーブル
CREATE TABLE micropost (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL
);

-- カテゴリーテーブル
CREATE TABLE category (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL
);

-- マイクロポストとカテゴリーの多対多の関係を表す中間テーブル
CREATE TABLE micropost_category (
  micropost_id INTEGER REFERENCES micropost(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES category(id) ON DELETE CASCADE,
  PRIMARY KEY (micropost_id, category_id)
);
```

```
-- ユーザーシードデータ
INSERT INTO public."user" (name) VALUES 
  ('Alice'),
  ('Bob'),
  ('Charlie');

-- カテゴリーシードデータ
INSERT INTO category (title) VALUES
  ('Technology'),
  ('Science'),
  ('Art');

-- マイクロポストシードデータ
INSERT INTO micropost (user_id, title) VALUES
  (1, 'Alice''s first post'),
  (1, 'Alice''s second post'),
  (2, 'Bob''s post'),
  (3, 'Charlie''s post');

-- マイクロポストとカテゴリーの多対多関係を作成するシードデータ
INSERT INTO micropost_category (micropost_id, category_id) VALUES
  (1, 1),
  (1, 2),
  (2, 3),
  (3, 1),
  (4, 3);
```