# OWL BUILD

このファイルは `owl-build` によって生成されました。

## 開発コマンド

- `npm run dev`: 開発モードでビルドしてウォッチ
- `npm run build`: 開発モードでビルド
- `npm run prod`: 本番モードでビルド
- `npm run lint-scss`: SCSSのリンター実行
- `npm run name -- <日本語>`: クラス命名ヘルパー（codic APIを使い、命名候補を表示）

## ディレクトリ構造 (`src/_sources`)

ソースファイルは `src/_sources` ディレクトリで管理され、ビルドプロセスによって `src/assets` へ出力されます。

### JS構造 (`src/_sources/_js`)

JavaScriptはESモジュール形式で記述し、クラスベースの設計を採用しています。

- `app.js`: エントリポイント。各モジュールのインポートと初期化を行います。
- `class/`: 状態を持つ再利用可能なクラス（Modal, InViewObserverなど）。
- `modules/`: 特定の機能を持つ関数モジュール（smoothScroll, toggleClassなど）。

### SCSS構造 (`src/_sources/_scss`)

FLOCSSをベースにした設計思想で構成されています。

- `app.scss`: メインのスタイルシート。
- `_config/`: 変数、フォント設定などの設定。
- `_mixin/`: Mixin定義（メディアクエリ、ユーティリティなど）。
- `_extend/`: プレースホルダーセレクタ（継承用）。
- `_global/`: リセットCSSや共通のベーススタイル。
- `_module/`: JSと連動する機能的なスタイル（Modal, InViewなど）。
- `component/`: 再利用可能なパーツ（ボタン、カードなど）。
- `layout/`: 各ページ固有または共通のレイアウト構造。
- `page/`: ページごとの固有スタイル。
- `block/`: WordPressブロックに関連するスタイル。
- `_utility/`: 単一機能のヘルパークラス（マージン、パディングなど）。

## コーディングルール

### JavaScript

- **ES Modules**: `import` / `export` を使用してモジュール化します。
- **Class-based**: 複雑な機能は `class` として定義し、`app.js` でインスタンス化します。
- **Naming**: クラス名は `PascalCase`、変数・関数名は `camelCase` を使用します。
- **DOM Access**: JSで操作する要素には `js-` 接頭辞をつけたクラスを使用するか、データ属性を使用することを推奨します。

### SCSS

- **BEM**: クラス命名にはFLOCSSを採用します。
- **Prefixes**:
  - `u-`: Utility（ユーティリティ）
  - `m-`: Module（JS連携などの機能モジュール）
  - `c-`: Component（再利用可能なコンポーネント）
  - `l-`: Layout（レイアウト要素）
  - `l-`: Page（ページ単位の要素）
  - `is-`: State（状態を示すクラス）
- **Import order**: `_config` -> `_mixin` -> `_global` -> `component` -> `layout` の順で読み込みます。
- **Variables**: 色、余白、フォントサイズなどは直接数値を書かず、`_config/_variable.scss` で定義された変数を使用してください。
