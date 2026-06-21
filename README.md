# owl-build

Viteを使用したWordPressテーマ開発用ビルドツール。

## 使い方

### プロジェクトのセットアップ

どこからでも、以下のコマンドで新しいプロジェクトを構築できます：

```bash
npx github:kzk215/owl-build -wp theme-name
```

#### コマンドの短縮設定（推奨）

毎回 `npx github:kzk215/owl-build` と入力するのが面倒な場合は、`.zshrc` や `.bashrc` にエイリアスを設定することで `owl-build` コマンドとして利用できるようになります。

1. 設定ファイル（例：`~/.zshrc`）を開き、末尾に以下を追記します：
   ```bash
   alias owl-build='npx github:kzk215/owl-build'
   ```
2. 設定を反映させます：
   ```bash
   source ~/.zshrc
   ```
3. 以降は以下の短いコマンドで実行可能です：
   ```bash
   owl-build -wp theme-name
   ```

   ※ `-wp` の後にテーマ名を指定しなかった場合、対話形式でテーマ名の入力を求められます：
   ```bash
   owl-build -wp
   # Enter theme name: (ここでテーマ名を入力)
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