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
