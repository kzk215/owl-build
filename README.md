# owl-build

Viteを使用したWordPressテーマ開発用ビルドツール。

## 使い方

### プロジェクトのセットアップ

1. 新しいプロジェクトディレクトリを作成し、移動します。
2. `wp/` ディレクトリに必要なテーマファイルを入れます。
3. 以下のコマンドを実行します：

```bash
npx owl-build -wp theme-name
```

このコマンドを実行すると、以下の処理が行われます：

- リモートリポジトリから設定ファイル（`_scripts`, `.gitignore`, `package.json`, `vite.config.mjs` など）を `degit` で取得します。
- `wp/` ディレクトリの内容を `src/theme-name` にコピーします。

### ローカルでの開発（owl-buildリポジトリ自体で実行する場合）

```bash
node bin/owl-build.mjs -wp theme-name --local
```