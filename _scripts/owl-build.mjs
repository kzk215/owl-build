#!/usr/bin/env node

/**
 * owl-build: WordPress および 静的HTML プロジェクトのセットアップスクリプト。
 * テンプレートリポジトリから必要なファイルをコピーし、初期設定を行います。
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import readline from 'readline';

// --- Constants & Globals ---
const TEMPLATE_REPO_URL = 'https://github.com/kzk215/owl-build.git';

// ANSI カラーコード
const COLORS = {
	reset: '\x1b[0m',
	green: '\x1b[32m',
	cyan: '\x1b[36m',
	yellow: '\x1b[33m',
	magenta: '\x1b[35m',
	blue: '\x1b[34m',
	red: '\x1b[31m'
};
const __dirname = (() => {
	try {
		return path.dirname(fileURLToPath(import.meta.url));
	} catch (e) {
		return process.cwd();
	}
})();

const CONFIG_FILES = [
	'_scripts',
	'paths.mjs',
	'.gitignore',
	'.stylelintrc.cjs',
	'package.json',
	'vite.config.mjs',
	'README-BUILD.md',
	'.env-local'
];

const DOCKER_FILES = ['docker-compose.yml', '.env-template'];

/** src/ 同期時に除外するディレクトリ名（テンプレート開発用の HTML コンポーネント集） */
const EXCLUDE_SOURCE_DIRS = ['catalog'];

// --- Utilities ---

/**
 * ディレクトリを再帰的にコピーする。
 * @param {string} src - コピー元パス
 * @param {string} dest - コピー先パス
 * @param {string[]} excludeFiles - 除外するファイル名のリスト
 */
function copyRecursiveSync(src, dest, excludeFiles = []) {
	if (!fs.existsSync(src)) return;

	const fileName = path.basename(src);
	if (excludeFiles.includes(fileName)) return;

	const stats = fs.statSync(src);
	if (stats.isDirectory()) {
		if (!fs.existsSync(dest)) {
			fs.mkdirSync(dest, { recursive: true });
		}
		fs.readdirSync(src).forEach((childItemName) => {
			copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName), excludeFiles);
		});
	} else {
		const destDir = path.dirname(dest);
		if (!fs.existsSync(destDir)) {
			fs.mkdirSync(destDir, { recursive: true });
		}
		fs.copyFileSync(src, dest);
	}
}

/**
 * 対話形式でユーザーに入力を求める。
 * @param {string} query - 質問内容
 * @returns {Promise<string>} ユーザーの入力内容
 */
async function askQuestion(query) {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	return new Promise((resolve) => {
		rl.question(query, (answer) => {
			rl.close();
			resolve(answer.trim());
		});
	});
}

/**
 * paths.mjs 内のテーマパスを更新する。
 * @param {string} filePath - paths.mjs のパス
 * @param {string} themeName - 設定するテーマ名
 */
function updatePathsMjs(filePath, themeName) {
	if (!fs.existsSync(filePath)) return;
	let content = fs.readFileSync(filePath, 'utf8');
	content = content.replace(/SOURCES_REL\s*[:=]\s*[`'"]src\/_sources[`'"]/, `SOURCES_REL: \`src/${themeName}/_sources\``);
	content = content.replace(/ASSETS_REL\s*[:=]\s*[`'"]src\/assets[`'"]/, `ASSETS_REL: \`src/${themeName}/assets\``);
	fs.writeFileSync(filePath, content);
}

/**
 * .env ファイルを作成し、THEME_NAME を設定する。
 * @param {string} srcPath - .env-template のパス
 * @param {string} destPath - 作成する .env のパス
 * @param {string} themeName - 設定するテーマ名
 * @param {boolean} isHtmlMode - HTMLモードかどうか
 */
function setupEnvFile(srcPath, destPath, themeName, isHtmlMode) {
	if (!fs.existsSync(srcPath)) return;
	let envContent = fs.readFileSync(srcPath, 'utf8');
	const nameToSet = isHtmlMode ? 'static-html' : themeName;
	envContent = envContent.replace(/THEME_NAME=.*/, `THEME_NAME=${nameToSet}`);
	fs.writeFileSync(destPath, envContent);
}

// --- Main Logic ---

/**
 * メインの実行関数。
 * 引数の解析からテンプレートの配置、初期設定までを行う。
 */
async function run() {
	const args = process.argv.slice(2);
	let themeName = null;
	let useLocal = args.includes('--local');
	let isHtmlMode = args.includes('-html') || args.includes('--html');
	let isWpMode = args.includes('-wp') || args.includes('--wp');

	console.log('--- owl-build Debug Log ---');
	console.log('Arguments:', args);
	console.log('Current working directory:', process.cwd());

	// テーマ名の取得 (WPモード)
	if (isWpMode) {
		const wpIdx = args.findIndex(arg => arg === '-wp' || arg === '--wp');
		if (args[wpIdx + 1] && !args[wpIdx + 1].startsWith('-')) {
			themeName = args[wpIdx + 1];
		} else {
			themeName = await askQuestion('Enter theme name: ');
		}

		if (!themeName) {
			console.error('Error: Theme name is required.');
			process.exit(1);
		}
	}

	if (!isHtmlMode && !isWpMode) {
		console.log('Usage:');
		console.log('  WordPress: owl-build -wp <theme-name> [--local]');
		console.log('  Static HTML: owl-build -html [--local]');
		process.exit(1);
	}

	const rootDir = process.cwd();
	const srcDir = path.join(rootDir, 'src');
	let templateDir = '';
	let isTempDir = false;

	// カレントディレクトリが owl-build 自体のリポジトリであるかチェック
	const isDevelopmentEnv = fs.existsSync(path.join(rootDir, 'paths.mjs')) && 
	                         fs.existsSync(path.join(rootDir, 'vite.config.mjs')) &&
	                         fs.existsSync(path.join(rootDir, '_scripts', 'owl-build.mjs'));

	try {
		// 1. テンプレートソースの準備
		if (useLocal || isDevelopmentEnv) {
			console.log(`${COLORS.cyan}Mode: Local${COLORS.reset}`);
			templateDir = useLocal ? path.resolve(__dirname, '..') : rootDir;
		} else {
			console.log(`${COLORS.cyan}Mode: Remote${COLORS.reset}`);
			templateDir = path.join(rootDir, '.owl-build-temp');
			isTempDir = true;
			if (fs.existsSync(templateDir)) {
				fs.rmSync(templateDir, { recursive: true, force: true });
			}
			console.log(`${COLORS.yellow}Cloning template repository from ${TEMPLATE_REPO_URL}...${COLORS.reset}`);
			execSync(`git clone --depth 1 ${TEMPLATE_REPO_URL} "${templateDir}"`, { stdio: 'inherit' });
		}

		const templateWpDir = path.join(templateDir, 'wp');
		const templateHtmlDir = path.join(templateDir, 'html');
		const templateSrcBaseDir = path.join(templateDir, 'src');

		const sourceContentDir = isHtmlMode ? templateHtmlDir : templateWpDir;
		const targetSrcDir = isHtmlMode ? srcDir : path.join(srcDir, themeName);

		// 2. 基本コンテンツのコピー (template/{wp,html} -> src/)
		if (fs.existsSync(sourceContentDir) && sourceContentDir !== path.join(rootDir, isHtmlMode ? 'html' : 'wp')) {
			console.log(`Copying template ${isHtmlMode ? 'html/' : 'wp/'} contents...`);
			copyRecursiveSync(sourceContentDir, targetSrcDir, ['docker-compose.yml', '.env-template', 'docker']);
		}

		// 3. 設定ファイルの配置
		for (const file of CONFIG_FILES) {
			const srcPath = path.join(templateDir, file);
			const destPath = path.join(rootDir, file);
			
			// 開発用ファイルはコピー対象外（プロジェクト配布時には含めない）
			if (file === 'docker-compose.local.yml') continue;

			// 開発環境自体の場合は、設定ファイルの上書きを避ける（paths.mjs 等のテーマ名書き換えは除く）
			if (isDevelopmentEnv && file !== 'paths.mjs') continue;

			if (srcPath !== destPath && fs.existsSync(srcPath)) {
				if (file === 'paths.mjs' && isWpMode) {
					// 開発環境自体の場合はバックアップをとるか、あるいは慎重に上書き
					if (isDevelopmentEnv) {
						console.log(`${COLORS.yellow}Updating paths.mjs in development environment...${COLORS.reset}`);
					}
					fs.copyFileSync(srcPath, destPath);
					updatePathsMjs(destPath, themeName);
					console.log(`${COLORS.green}${isDevelopmentEnv ? 'Updated' : 'Created'}${COLORS.reset} paths.mjs with theme path: src/${themeName}`);
				} else {
					copyRecursiveSync(srcPath, destPath);
					console.log(`${COLORS.green}Copied${COLORS.reset} ${file} to project root`);
				}
			}
		}

		// 4. Docker関連ファイルの配置
		for (const file of DOCKER_FILES) {
			const srcPath = path.join(sourceContentDir, file);
			if (fs.existsSync(srcPath)) {
				const destName = (file === '.env-template') ? '.env' : file;
				const destPath = path.join(rootDir, destName);

				// 開発環境自体の場合は、既存の Docker ファイルを壊さないようにする
				if (isDevelopmentEnv && fs.existsSync(destPath)) {
					console.log(`${COLORS.yellow}Skipped copying ${file} as it already exists in dev env.${COLORS.reset}`);
					continue;
				}

				if (file === '.env-template') {
					setupEnvFile(srcPath, destPath, themeName, isHtmlMode);
					console.log(`${COLORS.green}Created${COLORS.reset} .env and set THEME_NAME`);
				} else {
					fs.copyFileSync(srcPath, destPath);
					console.log(`${COLORS.green}Copied${COLORS.reset} ${file} to project root`);
				}
			}
		}

		// 5. テンプレート src/ の中身を同期（catalog はテンプレート開発用のため除外）
		if (fs.existsSync(templateSrcBaseDir) && templateSrcBaseDir !== srcDir) {
			copyRecursiveSync(templateSrcBaseDir, targetSrcDir, EXCLUDE_SOURCE_DIRS);
			console.log(`${COLORS.green}Copied${COLORS.reset} template src/ contents to ${targetSrcDir}`);
		}

		// 6. ローカルの wp/ or html/ ディレクトリがある場合の追加同期
		const localSourceDir = path.join(rootDir, isHtmlMode ? 'html' : 'wp');
		if (fs.existsSync(localSourceDir) && localSourceDir !== sourceContentDir) {
			console.log(`Syncing local ${isHtmlMode ? 'html/' : 'wp/'} directory...`);
			copyRecursiveSync(localSourceDir, targetSrcDir, ['docker', 'docker-compose.yml', '.env-template']);
		}

		// 7. モード別の最終調整
		if (isHtmlMode) {
			if (!fs.existsSync(srcDir)) fs.mkdirSync(srcDir, { recursive: true });
			const indexHtml = path.join(srcDir, 'index.html');
			if (!fs.existsSync(indexHtml)) {
				fs.writeFileSync(indexHtml, '<!DOCTYPE html>\n<html>\n<head><title>Static HTML</title></head>\n<body><h1>Hello Static HTML</h1></body>\n</html>');
				console.log(`${COLORS.green}Created${COLORS.reset} default index.html`);
			}
		} else {
			// WordPress テーマファイルの調整
			if (!fs.existsSync(targetSrcDir)) fs.mkdirSync(targetSrcDir, { recursive: true });

			const styleCssPath = path.join(targetSrcDir, 'style.css');
			const indexPhpPath = path.join(targetSrcDir, 'index.php');

			// style.css の作成または更新
			const styleHeader = `/*\nTheme Name: ${themeName}\nAuthor: owl-build\nVersion: 1.0.0\n*/`;
			if (!fs.existsSync(styleCssPath)) {
				fs.writeFileSync(styleCssPath, styleHeader);
				console.log(`${COLORS.green}Created${COLORS.reset} style.css`);
			} else {
				const content = fs.readFileSync(styleCssPath, 'utf8').trim();
				if (!content || !content.includes('Theme Name:')) {
					fs.writeFileSync(styleCssPath, styleHeader + (content ? '\n\n' + content : ''));
					console.log(`${COLORS.yellow}Updated${COLORS.reset} style.css with theme header`);
				}
			}

			// index.php の作成 (存在しない場合のみ)
			if (!fs.existsSync(indexPhpPath)) {
				fs.writeFileSync(indexPhpPath, `<?php\n// Generated by owl-build\n?>`);
				console.log(`${COLORS.green}Created${COLORS.reset} index.php`);
			}
		}

		if (isTempDir) {
			fs.rmSync(templateDir, { recursive: true, force: true });
			console.log('Cleaned up temporary directory.');
		}

		console.log(`
            .                               .::- -
            +*:                          --#*-- .-
            **##*+                     +-*#*:+  --
            -*####=:+.          ..:--- *###:=: .--
               :####: .:  .-.::::+-: -###*:+  .=-=
              ++=+*%#%- ::=:--=-=- =%%+==-:  ..+-+
            :=#-::+-*@%+*..+++++.:=====+::=:..#-+*
-          ==*=:.#-%@@@@%+=     +#%@@@@-:..=-**+:.
 :.        =-*:. :++@@@@**  :#: =#@@@@@--.:==-    
.  .: .=***:**:.   .-*-:   +%#%.  :=+**.  .:      
=.      --  -*:....        -*@%:        ..::      
=#+....+-..: =+. ..........=*++: ..... .:=*-      
--=+=:-*.   ::.*=-.--.-=-=::@@=--:-=-..-=+*       
------*::      .*+**-....-+*:-..     .:*+#-+      
-=--=+:=-..  .    ::=+      -+ +--  .. =*+:-      
---=#-.=+:. :+   =- ++ -#    = + : .*-..=*.       
***+=.-:*:=.-*. :#= -. -::   --  . *=:.+.=        
-*=-*=*.-+*.-*...*.... -.=  .=.= .....::=*        
:-*#+---==---+-::.:::+. .. ....+.:-.::.:+-        
::*=++=.      .==*-*=+------:..:-=-::   .=        
*+%.#+-.....   ..+-+=--+-.*=%%**------.. .%       
  =:+.....:=..%@@%%=-:::-:=#%%+*#*+%@@=:-+*+      
  :#-.....%@@@*#@@+.....  +#%%#*****@@%%%@@:      
 .:....==*%%@@*-=@%.....::.=*#######@@#*%@@##*    
 ::*=-* ..+#%@@........:===*%%%%%%##*##*#%#***=:  
`);

		console.log('\n\x1b[32m--- owl-build completed successfully! ---\x1b[0m');
		console.log(`\nNext steps:\n1. npm install\n2. npm run dev\n3. docker compose up -d\n`);

	} catch (err) {
		console.error('Error during setup:', err.message);
		if (isTempDir && fs.existsSync(templateDir)) {
			fs.rmSync(templateDir, { recursive: true, force: true });
		}
		process.exit(1);
	}
}

run();
