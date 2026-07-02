# owl-build

Viteを使用したWordPressテーマ開発および静的HTML開発用のビルドツール。

## 使い方

### 1. プロジェクトのセットアップ

どこからでも、以下のコマンドで新しいプロジェクトを構築できます。事前に `wp/` 等を用意していなくても、自動的に雛形が作成されます。

#### WordPress テーマ開発の場合
```bash
npx -y github:kzk215/owl-build#main -wp 好きなテーマ名
```

#### 静的 HTML 開発の場合
```bash
npx -y github:kzk215/owl-build#main -html
```

---

### 2. セットアップ後の流れ
構築が完了したら、以下の手順で開発を開始します。

```bash
# 1. 依存パッケージのインストール
npm install

# 2. 開発サーバーの起動（ウォッチモード & ブラウザ自動起動）
npm run dev

# 3. Docker 環境の立ち上げ（WordPress等の場合）
docker compose up -d
```

---

### ディレクトリ構造（セットアップ後）

セットアップを実行すると、以下のような構成でファイルが自動配置されます。

```text
(プロジェクトルート)
├── paths.mjs           # ビルドパスの設定（WPモード時はテーマ名が自動挿入されます）
├── package.json        # 各種スクリプト・依存関係
├── vite.config.mjs     # Viteの設定
├── _scripts/           # セットアップスクリプト・補助ツール
├── src/
│   └── (テーマ名)/      # WordPressテーマのソース（HTMLモード時は src 直下に展開）
│       ├── _sources/   # Sass / JS のソースファイル
│       └── assets/     # ビルド済みのアセット
├── .env                # Docker用環境変数（THEME_NAME等が自動設定されます）
└── docker-compose.yml  # Docker構成ファイル
```

---

### 開発・ビルドコマンド

- `npm run dev`: 開発モードでビルドしてウォッチ（HMR有効）
- `npm run build`: 開発モードでビルド
- `npm run prod`: 本番モードでビルド（圧縮あり）
- `npm run lint-scss`: SCSSのリンター実行

---

### 開発者向けのデバッグ（owl-build 自体の開発時）

このリポジトリ自体の動作を確認したり、VIEWをチェックしたりする場合は以下のコマンドを使用します。

- **デバッグ用サーバーの起動**:
  ```bash
  npm run docker:dev
  ```
  ※ `docker-compose.local.yml` を使用して、`src/` の内容を即座に確認できます。
- **ローカルでのセットアップテスト**:
  ```bash
  node _scripts/owl-build.mjs -wp test-view --local
  ```

---

### 留意事項
- **キャッシュについて**: `npx` で古い挙動になる場合は、リポジトリ名の後ろに `#main` を付けて実行してください。
- **wp/ フォルダ**: 実行ディレクトリに `wp/` フォルダがある場合は、その中身が優先的に `src/` へ同期されます。ない場合は最小限の雛形が作成されます。
