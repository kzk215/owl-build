// scripts/paths.mjs
import path from "node:path";
import {fileURLToPath} from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ============================================================
 * ビルドターゲット設定
 * 入力（SOURCES_REL）と出力（ASSETS_REL）のペアを自由に追加できます
 *
 * 各ターゲットで指定できるオプションキー（省略時はデフォルト値を使用）：
 *   entryScssFile  入力 SCSS ファイル名  （デフォルト: ENTRY_SCSS_FILE）
 *   entryJsFile    入力 JS ファイル名    （デフォルト: ENTRY_JS_FILE）
 *   distCssFile    出力 CSS ファイル名   （デフォルト: DIST_CSS_FILE）
 *   distJsFile     出力 JS ファイル名    （デフォルト: DIST_JS_FILE）
 *
 * 出力方式オプション（省略時は mode に応じた自動判定）：
 *   minify         圧縮するか  true / false / 'esbuild' / 'terser'
 *                  （省略時: production なら true、development なら false）
 *   sourcemap      ソースマップ  true / false / 'inline' / 'hidden'
 *                  （省略時: true）
 * ============================================================ */
export const TARGETS_CONFIG = [
	{
		name: "",
		SOURCES_REL: `src/_sources`,
		ASSETS_REL: `src/assets`,
	},
	// 追加例：
	// {
	// 	name:          "LP",
	// 	SOURCES_REL:   `LP/_sources`,
	// 	ASSETS_REL:    `LP/_lp`,
	// 	entryScssFile: 'lp.scss',
	// 	entryJsFile:   'lp.js',
	// 	distCssFile:   'lp.css',
	// 	distJsFile:    'lp.bundle.js',
	// 	minify:        true,
	// 	sourcemap:     false,
	// },
];

/* ============================================================
 * 環境変数 TARGET で絞り込み（省略時は全ターゲットをビルド）
 * TARGET=PC         → PC のみ
 * TARGET=PC,SP      → PC と SP
 * TARGET=（未指定） → TARGETS_CONFIG に定義した全ターゲット
 * ============================================================ */
const TARGET_ENV = process.env.TARGET ?? "";

export const TARGETS = TARGET_ENV
	? TARGET_ENV.split(",").map((s) => s.trim()).filter(Boolean)
	: TARGETS_CONFIG.map((c) => c.name);

// name → config のマップ
const TARGET_MAP = Object.fromEntries(TARGETS_CONFIG.map((c) => [c.name, c]));

/* ============================================================
 * エントリーファイル名 / ディレクトリ名設定
 * ============================================================ */
export const ENTRY_SCSS_FILE = 'app.scss';
export const ENTRY_JS_FILE = 'app.js';
export const DIST_CSS_FILE = 'app.css';
export const DIST_JS_FILE = 'app.bundle.js';
export const INPUT_SCSS_DIR = `_scss`;
export const INPUT_JS_DIR = `_js`;
export const OUTPUT_CSS_DIR = `css`;
export const OUTPUT_JS_DIR = `js`;
export const EXCLUDE_IMG_DIR = `img`;
export const INPUT_ICONS_DIR = `_icons`;
export const OUTPUT_ICONS_DIR = `icons`;
export const ICONS_SPRITE_FILE = `icons.svg`;

/* -------------------------------------------- */

export const ROOT = path.resolve(__dirname, ".");

/**
 * ターゲット名を受け取り、絶対パス一式を返す
 * @param {string} targetName - TARGETS_CONFIG の name
 */
export function resolveTargetPaths(targetName) {
	const config = TARGET_MAP[targetName];
	if (!config) throw new Error(`Unknown target: "${targetName}"`);

	const {
		SOURCES_REL, ASSETS_REL,
		entryScssFile = ENTRY_SCSS_FILE,
		entryJsFile = ENTRY_JS_FILE,
		distCssFile = DIST_CSS_FILE,
		distJsFile = DIST_JS_FILE,
		minify,
		sourcemap,
	} = config;

	const SCSS_REL = `${SOURCES_REL}/${INPUT_SCSS_DIR}`;
	const JS_INPUT_REL = `${SOURCES_REL}/${INPUT_JS_DIR}`;
	const CSS_REL = `${ASSETS_REL}/${OUTPUT_CSS_DIR}`;
	const JS_REL = `${ASSETS_REL}/${OUTPUT_JS_DIR}`;

	const SOURCES_ABS = path.resolve(ROOT, SOURCES_REL);
	const ASSETS_ABS = path.resolve(ROOT, ASSETS_REL);
	const SCSS_ABS = path.resolve(ROOT, SCSS_REL);
	const JS_INPUT_ABS = path.resolve(ROOT, JS_INPUT_REL);
	const JS_ABS = path.resolve(ROOT, JS_REL);
	const CSS_ABS = path.resolve(ROOT, CSS_REL);
	const ICONS_ABS = path.resolve(ASSETS_ABS, OUTPUT_ICONS_DIR);
	const ICONS_SPRITE_ABS = path.resolve(ASSETS_ABS, OUTPUT_ICONS_DIR, ICONS_SPRITE_FILE);

	const ENTRY = {
		scss: path.resolve(SCSS_ABS, entryScssFile),
		js: path.resolve(JS_INPUT_ABS, entryJsFile),
	};

	const OUT = {
		cssFile: `${OUTPUT_CSS_DIR}/${distCssFile}`,
		cssAssets: `${OUTPUT_CSS_DIR}/[name][extname]`,
		jsEntry: `${OUTPUT_JS_DIR}/${distJsFile}`,
	};

	const STYLELINT_GLOB = `${SCSS_ABS.replaceAll("\\", "/")}/**/*.scss`;

	return {
		target: targetName,
		SOURCES_REL, ASSETS_REL,
		SCSS_REL, JS_INPUT_REL, CSS_REL, JS_REL,
		SOURCES_ABS, ASSETS_ABS, SCSS_ABS, JS_INPUT_ABS, JS_ABS, CSS_ABS, ICONS_ABS, ICONS_SPRITE_ABS,
		ENTRY, OUT, STYLELINT_GLOB,
		minify,
		sourcemap,
	};
}

/* ============================================================
 * 後方互換：先頭ターゲットの値を named export
 * ============================================================ */
const _p = resolveTargetPaths(TARGETS[0]);
export const SOURCES_REL = _p.SOURCES_REL;
export const ASSETS_REL = _p.ASSETS_REL;
export const SCSS_REL = _p.SCSS_REL;
export const JS_INPUT_REL = _p.JS_INPUT_REL;
export const CSS_REL = _p.CSS_REL;
export const JS_REL = _p.JS_REL;
export const SOURCES_ABS = _p.SOURCES_ABS;
export const ASSETS_ABS = _p.ASSETS_ABS;
export const SCSS_ABS = _p.SCSS_ABS;
export const JS_INPUT_ABS = _p.JS_INPUT_ABS;
export const JS_ABS = _p.JS_ABS;
export const CSS_ABS = _p.CSS_ABS;
export const ICONS_ABS = _p.ICONS_ABS;
export const ICONS_SPRITE_ABS = _p.ICONS_SPRITE_ABS;
export const ENTRY = _p.ENTRY;
export const OUT = _p.OUT;
// stylelint 用（OS差を潰す）
export const STYLELINT_GLOB = _p.STYLELINT_GLOB;
