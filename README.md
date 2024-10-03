# プロジェクトセットアップガイド

## バックエンド

### セットアップ

```
cd typescript-nextjs-nestjs-postgresql\backend
npm i
```

### データベースのセットアップ

データベースをリセットするには、以下のいずれかのコマンドを実行します：

```
cd typescript-nextjs-nestjs-postgresql\backend
npm run resetDatabase
```

または

```
cd typescript-nextjs-nestjs-postgresql\backend
npx ts-node ./database/resetDatabase.ts
```

### アプリケーションの起動

開発モードでアプリケーションを起動するには：

```
cd typescript-nextjs-nestjs-postgresql\backend
npm run start:dev
```

これは内部的に以下を実行します：

```
cd typescript-nextjs-nestjs-postgresql\backend
$env:NODE_ENV='development'; nest start --watch
```

### テストの実行

カバレッジレポート付きでテストを実行：

```
cd typescript-nextjs-nestjs-postgresql\backend
npm run test:cov
```

E2Eテストを実行：

```
cd typescript-nextjs-nestjs-postgresql\backend
npm run test:e2e
```

これは内部的に以下を実行します：

```
$env:NODE_ENV='test'; npx jest --config ./test/jest-e2e.json --verbose --runInBand --detectOpenHandles
```

### 環境設定

#### 開発環境 (.env)

```
DB_USER=postgres
DB_HOST=localhost
DB_NAME=web_app_db_integration
DB_PASSWORD=postgres
DB_PORT=5432
```

#### テスト環境 (.env.test)

```
DB_USER=postgres
DB_HOST=localhost
DB_NAME=web_app_db_integration_test
DB_PASSWORD=postgres
DB_PORT=5432
```

注意：テスト環境では、データベース名が `web_app_db_integration_test` に設定されています。

## フロントエンド

### セットアップ

```
cd typescript-nextjs-nestjs-postgresql\frontend
npm i
```

### 起動

```
npm run dev
```

### テスト

単体テスト：

```
npm run test
```

E2Eテスト：

```
npm run playwright
```