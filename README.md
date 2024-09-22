# バックエンドのセットアップと実行手順

## データベースのセットアップ

データベースをリセットするには、以下のコマンドを実行します：

```
npm run resetDatabase
```

または

```
npx ts-node ./database/resetDatabase.ts
```

## アプリケーションの起動

開発モードでアプリケーションを起動するには、以下のコマンドを使用します：

```
npm run start:dev
```

これは内部的に以下のコマンドを実行します：

```
$env:NODE_ENV='development'; nest start --watch
```

## テストの実行

カバレッジレポート付きでテストを実行するには：

```
npm run test:cov
```

E2Eテストを実行するには：

```
npm run test:e2e
```

これは内部的に以下のコマンドを実行します：

```
$env:NODE_ENV='test'; npx jest --config ./test/jest-e2e.json --verbose --runInBand --detectOpenHandles
```

## 環境設定

### 開発環境 (.env)

```
DB_USER=postgres
DB_HOST=localhost
DB_NAME=web_app_db_integration
DB_PASSWORD=postgres
DB_PORT=5432
```

### テスト環境 (.env.test)

```
DB_USER=postgres
DB_HOST=localhost
DB_NAME=web_app_db_integration_test
DB_PASSWORD=postgres
DB_PORT=5432
```

注意：テスト環境では、データベース名が `web_app_db_integration_test` に設定されています。これにより、テスト実行時に本番データベースに影響を与えることなくテストを行うことができます。