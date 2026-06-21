# owl-build

Viteを使用したWordPressテーマ開発用ビルドツール。

## 使い方

### プロジェクトのセットアップ

どこからでも、以下のコマンドで新しいプロジェクトを構築できます：

```bash
npx github:kzk215/owl-build -wp theme-name
```

> **注意**: パッケージが npm に公開されていない場合、上記のコマンドは `404 Not Found` になります。
> 公開前のテストや、GitHub から直接実行したい場合は以下のコマンドを使用してください：
> ```bash
> npx github:kzk215/owl-build -wp theme-name
> ```

このコマンドを実行すると、以下の処理が行われます：

- リモートリポジトリ（`kzk215/owl-build`）から設定ファイル（`_scripts`, `.gitignore`, `package.json`, `vite.config.mjs` など）を `degit` で取得し、プロジェクトルートに配置します。
- カレントディレクトリにある `wp/` ディレクトリの内容を `src/` にコピーします。

実行後のディレクトリ構造：
```text
(プロジェクトルート)
├── src/
│   └── (wpの中身)
├── bin/
├── _scripts/
├── .gitignore
├── .stylelintrc.cjs 
├── package.json
├── README-BUILD.md
└── vite.config.mjs
```

### npmを使わずに初期構築する

npmにパッケージを公開していなくても、または `npx` を使いたくない場合でも、以下の手順で構築が可能です。

1. **スクリプトをダウンロードして実行する**
   プロジェクトを作成したいディレクトリ（`wp/` フォルダがある場所）で以下を実行してください。

   ```bash
   # リポジトリを一時的にクローンして実行
   git clone --depth 1 https://github.com/kzk215/owl-build.git .owl-build-temp
   node .owl-build-temp/bin/owl-build.mjs -wp theme-name
   rm -rf .owl-build-temp
   ```

2. **curl を使って実行する**（GitとNode.jsがインストールされている必要があります）
   ```bash
   curl -sSL https://raw.githubusercontent.com/kzk215/owl-build/main/bin/owl-build.mjs | node - -wp theme-name
   ```
   ※ この場合、スクリプト内部で `git clone` を実行して設定ファイルを取得します。

---

### 利用条件

1. **`wp/` ディレクトリの準備**: 実行するディレクトリに、WordPressテーマの元ファイルを入れた `wp/` フォルダを作成しておいてください。
2. **Node.js**: Node.jsがインストールされている環境であれば、`npx` を通じてどこでも実行可能です。

### ローカルでの開発（owl-buildリポジトリ自体で実行する場合）

```bash
node bin/owl-build.mjs -wp theme-name --local
```