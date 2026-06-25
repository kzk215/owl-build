#!/usr/bin/env node
/**
 * クラス命名ヘルパー
 *   日本語を codic API で英訳し、複数ケース + FLOCSS プレフィックス候補を表示する。
 *
 * 使い方:
 *   npm run name -- カルーセル
 *   npm run name -- 新着記事一覧
 *
 * セットアップ:
 *   1) https://codic.jp/ で無料アカウントを作成
 *   2) マイページ → ACCESS TOKEN からトークンを発行
 *   3) プロジェクト直下の .env に CODIC_ACCESS_TOKEN=xxxxx を記入
 */

import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

/* ============================================================
 * .env 読み込み（依存ゼロ）
 * ============================================================ */
function loadEnv(envPath) {
	if (!fs.existsSync(envPath)) return;
	const content = fs.readFileSync(envPath, "utf8");
	for (const line of content.split(/\r?\n/)) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) continue;
		const idx = trimmed.indexOf("=");
		if (idx === -1) continue;
		const key = trimmed.slice(0, idx).trim();
		let value = trimmed.slice(idx + 1).trim();
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}
		if (!(key in process.env)) process.env[key] = value;
	}
}

loadEnv(path.join(ROOT, ".env"));

const TOKEN = (process.env.CODIC_ACCESS_TOKEN || "").trim();

/* ============================================================
 * ANSI カラー
 * ============================================================ */
const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const wrap = (code) => (s) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : s);
const c = {
	bold: wrap("1"),
	dim: wrap("2"),
	red: wrap("31"),
	green: wrap("32"),
	yellow: wrap("33"),
	blue: wrap("34"),
	magenta: wrap("35"),
	cyan: wrap("36"),
	gray: wrap("90"),
};

const HR = c.dim("━".repeat(56));

/* ============================================================
 * 使い方表示
 * ============================================================ */
function printUsage() {
	console.log(`
${c.bold("使い方:")} npm run name -- <日本語>

${c.bold("例:")}
  npm run name -- カルーセル
  npm run name -- 新着記事一覧
  npm run name -- "ユーザー プロフィール"
`);
}

/* ============================================================
 * 引数チェック
 * ============================================================ */
const args = process.argv.slice(2).filter(Boolean);
if (args.length === 0) {
	printUsage();
	process.exit(1);
}
const inputText = args.join(" ");

if (!TOKEN) {
	console.error(`
${c.red(c.bold("[Error]"))} .env に ${c.cyan("CODIC_ACCESS_TOKEN")} が設定されていません。

${c.bold("セットアップ手順:")}
  1) ${c.cyan("https://codic.jp/")} で無料アカウントを作成
  2) マイページ → ${c.cyan("ACCESS TOKEN")} からトークンを発行
  3) プロジェクト直下の ${c.cyan(".env")} に下記を記入:

     ${c.gray("CODIC_ACCESS_TOKEN=取得したトークン")}
`);
	process.exit(1);
}

/* ============================================================
 * ケース変換ユーティリティ
 * ============================================================ */

// codic words[].translated_text からトークン配列を作る
function tokensFromWords(words) {
	return words
		.map((w) => (w.translated_text || "").trim())
		.filter(Boolean)
		.flatMap((s) => s.split(/[\s_-]+/))
		.filter(Boolean)
		.map((s) => s.toLowerCase());
}

const toCamel = (tokens) =>
	tokens
		.map((t, i) => (i === 0 ? t : t.charAt(0).toUpperCase() + t.slice(1)))
		.join("");
const toPascal = (tokens) =>
	tokens.map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join("");
const toKebab = (tokens) => tokens.join("-");
const toSnake = (tokens) => tokens.join("_");
const toConstant = (tokens) => tokens.map((t) => t.toUpperCase()).join("_");

/* ============================================================
 * codic API 呼び出し
 * ============================================================ */
async function translate(text) {
	const url = "https://api.codic.jp/v1/engine/translate.json";
	const body = new URLSearchParams({
		text,
		casing: "camel",
	});

	let res;
	try {
		res = await fetch(url, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${TOKEN}`,
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body,
		});
	} catch (e) {
		throw new Error(`ネットワークエラー: ${e.message}`);
	}

	if (!res.ok) {
		let detail = "";
		try {
			detail = await res.text();
		} catch {}
		if (res.status === 401) {
			throw new Error(
				"認証エラー (401)。.env の CODIC_ACCESS_TOKEN が正しいか確認してください。"
			);
		}
		throw new Error(`codic API エラー ${res.status}: ${detail}`);
	}

	const data = await res.json();
	// codic は配列で返る（複数行対応）。1行目を返す
	return Array.isArray(data) ? data[0] : data;
}

/* ============================================================
 * メイン
 * ============================================================ */
try {
	const result = await translate(inputText);

	if (!result || !Array.isArray(result.words) || result.words.length === 0) {
		console.error(`${c.red(c.bold("[Error]"))} 翻訳結果が空でした。`);
		process.exit(1);
	}

	const tokens = tokensFromWords(result.words);

	if (tokens.length === 0) {
		console.error(
			`${c.red(c.bold("[Error]"))} 命名に使えるトークンが取得できませんでした。`
		);
		console.error(c.gray(JSON.stringify(result.words, null, 2)));
		process.exit(1);
	}

	const camel = toCamel(tokens);
	const pascal = toPascal(tokens);
	const kebab = toKebab(tokens);
	const snake = toSnake(tokens);
	const constant = toConstant(tokens);

	const pad = (s) => s.padEnd(16, " ");

	const wordsLine = result.words
		.map((w) => {
			const src = w.text || "";
			const dst = w.translated_text || c.gray("(skip)");
			return `${src}${c.gray("→")}${c.green(dst)}`;
		})
		.join(", ");

	console.log(`
${HR}
${c.bold("入力:")} ${inputText}
${c.bold("単語:")} ${wordsLine}
${HR}

${c.bold(c.cyan("■ ケース別"))}
  ${pad("camelCase")}${c.green(camel)}
  ${pad("PascalCase")}${c.green(pascal)}
  ${pad("kebab-case")}${c.green(kebab)}
  ${pad("snake_case")}${c.green(snake)}
  ${pad("CONSTANT_CASE")}${c.green(constant)}

${c.bold(c.magenta("■ FLOCSS 候補"))}
  ${pad("Component (c-)")}${c.green("c-" + camel)}
  ${pad("Layout    (l-)")}${c.green("l-" + camel)}
  ${pad("Module    (m-)")}${c.green("m-" + camel)}
  ${pad("Utility   (u-)")}${c.green("u-" + camel)}
  ${pad("State    (is-)")}${c.green("is-" + camel)}
  ${pad("JS Hook  (js-)")}${c.green("js-" + camel)}
${HR}
`);
} catch (err) {
	console.error(`${c.red(c.bold("[Error]"))} ${err.message}`);
	process.exit(1);
}
