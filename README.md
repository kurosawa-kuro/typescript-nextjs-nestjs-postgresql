expressのTS化
→ Done
DI化
→ Done

金曜日
Prisma
sqlite
Postgres

Test DB

土曜日午後
抽象サービスクラス
抽象コントローラクラス

backend\src\app\mockData\users.ts廃止時点で
ディレクトリ構造を改革

後で
Swagger
StroryBook

アプリ設計をリファクタリングしてください

# 改善されたデータベース設計

## テーブル

### users
- id (主キー)
- name
- email (ユニーク)
- password_hash
- is_admin
- memo
- created_at
- updated_at

### microposts
- id (主キー)
- user_id (外部キー)
- title
- content
- image_path
- created_at
- updated_at

### categories
- id (主キー)
- title
- created_at
- updated_at

### micropost_categories (中間テーブル)
- id (主キー)
- micropost_id (外部キー)
- category_id (外部キー)
- created_at
- updated_at

## リレーションシップ
- users - microposts: 1対多
- microposts - categories: 多対多 (micropost_categories中間テーブルを介して)

user-micropost 一対多
micropost-cagtegory 多対多