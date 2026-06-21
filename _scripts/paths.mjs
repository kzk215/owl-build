
// scripts/paths.mjs
import path from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 初期設定
 * @type {string}
 */
export const SOURCES_REL = `src/gojoh/_sources`; // ソース入力
export const ASSETS_REL = `src/gojoh/assets`; // 出力
// export const VITE_HMR_PORT = '3080';

// エントリーファイル名設定
export const ENTRY_SCSS_FILE = 'app.scss';
export const ENTRY_JS_FILE = 'app.js'
export const DIST_CSS_FILE = 'app.css'
// 下層ディレクトリ名設定
export const INPUT_SCSS_DIR = `_scss`;
export const INPUT_JS_DIR = `_js`;
export const OUTPUT_CSS_DIR = `css`;
export const OUTPUT_JS_DIR = `js`;
export const EXCLUDE_IMG_DIR = `img`;



/* -------------------------------------------- */

export const SCSS_REL = `${SOURCES_REL}/${INPUT_SCSS_DIR}`;
export const JS_INPUT_REL = `${SOURCES_REL}/${INPUT_JS_DIR}`;
export const CSS_REL = `${ASSETS_REL}/${OUTPUT_CSS_DIR}`;
export const JS_REL = `${ASSETS_REL}/${OUTPUT_JS_DIR}`;
export const ROOT = path.resolve(__dirname, "..");
export const SOURCES_ABS = path.resolve(ROOT, SOURCES_REL);
export const ASSETS_ABS = path.resolve(ROOT, ASSETS_REL);
export const SCSS_ABS = path.resolve(ROOT, SCSS_REL);
export const JS_INPUT_ABS = path.resolve(ROOT, JS_INPUT_REL);
export const JS_ABS = path.resolve(ROOT, JS_REL);
export const CSS_ABS = path.resolve(ROOT, CSS_REL);

export const ENTRY = {
	scss: path.resolve(SCSS_ABS, ENTRY_SCSS_FILE),
	js: path.resolve(JS_INPUT_ABS, ENTRY_JS_FILE),
};

export const OUT = {
	cssFile: `${OUTPUT_CSS_DIR}/${DIST_CSS_FILE}`,
	cssAssets: `${OUTPUT_CSS_DIR}/[name][extname]`,
	jsEntry: `${OUTPUT_JS_DIR}/[name].bundle.js`,
};
// stylelint 用（OS差を潰す）
export const STYLELINT_GLOB = `${SCSS_ABS.replaceAll("\\", "/")}/**/*.scss`;