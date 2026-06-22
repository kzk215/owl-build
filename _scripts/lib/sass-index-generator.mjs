import path from "node:path";
import fs from "node:fs/promises";
import { SCSS_ABS, ICONS_ABS, ICONS_SPRITE_ABS } from "../../paths.mjs";

/**
 * _00-index.scss および _icons.scss を自動生成する Vite プラグイン
 */
export function sassIndexGenerator() {
	return {
		name: "sass-index-generator",
		async buildStart() {
			await generateAllIndices(SCSS_ABS);
			await updateIconsFile();
			await generateIconsSprite();
		},
		async handleHotUpdate({ file, server }) {
			// SCSS ファイルが追加・削除された可能性がある場合に再生成
			if (file.endsWith(".scss") && !path.basename(file).startsWith("_00-index")) {
				await generateAllIndices(SCSS_ABS);
			}
			// アイコンファイルが変更された場合に _icons.scss とスプライトを更新
			if (file.includes("/_icons/")) {
				await updateIconsFile();
				await generateIconsSprite();
			}
		}
	};
}

/**
 * _scss ディレクトリ配下を再帰的に走査し、_00-index.scss を更新する
 */
async function generateAllIndices(dir) {
	const entries = await fs.readdir(dir, { withFileTypes: true });
	const subDirs = [];

	for (const entry of entries) {
		if (entry.isDirectory()) {
			subDirs.push(path.join(dir, entry.name));
		}
	}

	// このディレクトリの _00-index.scss を更新
	const indexPath = path.join(dir, "_00-index.scss");
	const ignoreDirs = ["_config", "_global", "_mixin", "_extend"];
	if (dir !== SCSS_ABS && !ignoreDirs.some(ignore => dir.endsWith(ignore))) {
		await updateIndexFile(dir, indexPath);
	}

	// サブディレクトリも再帰的に処理
	for (const subDir of subDirs) {
		await generateAllIndices(subDir);
	}
}

/**
 * 指定されたディレクトリのファイルおよびサブディレクトリを元に _00-index.scss を書き換える
 */
async function updateIndexFile(dir, indexPath) {
	const entries = await fs.readdir(dir, { withFileTypes: true });
	const targets = [];

	for (const entry of entries) {
		if (entry.isFile() && entry.name.endsWith(".scss") && entry.name !== "_00-index.scss") {
			// 拡張子を除去し、先頭のアンダースコアも除去
			let name = entry.name.replace(/\.scss$/, "");
			if (name.startsWith("_")) {
				name = name.substring(1);
			}
			targets.push(name);
		} else if (entry.isDirectory()) {
			// サブディレクトリ内に _00-index.scss があるか確認
			const subIndexPath = path.join(dir, entry.name, "_00-index.scss");
			try {
				await fs.access(subIndexPath);
				targets.push(`${entry.name}/00-index`);
			} catch (e) {
				// サブディレクトリに _00-index.scss がなければ、その中のファイルを直接追加 (フラット化)
				const subEntries = await fs.readdir(path.join(dir, entry.name), { withFileTypes: true });
				for (const subEntry of subEntries) {
					if (subEntry.isFile() && subEntry.name.endsWith(".scss") && subEntry.name !== "_00-index.scss") {
						let subName = subEntry.name.replace(/\.scss$/, "");
						if (subName.startsWith("_")) {
							subName = subName.substring(1);
						}
						targets.push(`${entry.name}/${subName}`);
					}
				}
			}
		}
	}

	targets.sort();

	const content = targets.map(name => `@forward "${name}";`).join("\n") + (targets.length > 0 ? "\n" : "");

	const currentContent = await fs.readFile(indexPath, "utf-8").catch(() => "");
	if (content !== currentContent) {
		// ターゲットがない、かつ元々ファイルが存在しなかった場合は作成しない
		if (targets.length === 0) {
			try {
				await fs.access(indexPath);
			} catch (e) {
				return;
			}
		}
		await fs.writeFile(indexPath, content, "utf-8");
		console.log(`[sass-index] Updated: ${path.relative(process.cwd(), indexPath)}`);
	}
}

/**
 * _icons.scss を更新する
 */
async function updateIconsFile() {
	const iconsPath = path.join(SCSS_ABS, "_config", "_icons.scss");
	
	try {
		const entries = await fs.readdir(ICONS_ABS, { withFileTypes: true });
		const icons = entries
			.filter(e => e.isFile() && e.name.startsWith("ico-") && e.name.endsWith(".svg"))
			.map(e => {
				const name = e.name.replace(/^ico-/, "").replace(/\.svg$/, "");
				return { name, filename: e.name };
			})
			.sort((a, b) => a.name.localeCompare(b.name));

		const iconDir = "../../assets/icons";
		const spriteFile = "icons.svg";
		let content = `$icon-dir: "${iconDir}";\n$icons-sprite: "#{$icon-dir}/${spriteFile}";\n\n$icons: (\n`;
		content += icons.map(icon => `\t${icon.name}: "#{$icon-dir}/${icon.filename}"`).join(",\n");
		content += `\n);\n`;

		const currentContent = await fs.readFile(iconsPath, "utf-8").catch(() => "");
		if (content !== currentContent) {
			await fs.writeFile(iconsPath, content, "utf-8");
			console.log(`[sass-index] Updated: ${path.relative(process.cwd(), iconsPath)}`);
		}
	} catch (err) {
		if (err.code !== 'ENOENT') {
			console.error("[sass-index] Failed to update _icons.scss:", err);
		}
	}
}

/**
 * SVGスプライトファイルを生成する
 */
async function generateIconsSprite() {
	try {
		const entries = await fs.readdir(ICONS_ABS, { withFileTypes: true });
		const icons = entries
			.filter(e => e.isFile() && e.name.startsWith("ico-") && e.name.endsWith(".svg"))
			.sort((a, b) => a.name.localeCompare(b.name));

		const symbols = [];
		for (const icon of icons) {
			const id = icon.name.replace(/\.svg$/, "");
			const svgContent = await fs.readFile(path.join(ICONS_ABS, icon.name), "utf-8");

			// viewBox を抽出
			const viewBoxMatch = svgContent.match(/viewBox=["']([^"']+)["']/);
			const viewBox = viewBoxMatch ? ` viewBox="${viewBoxMatch[1]}"` : "";

			// SVG内部のコンテンツを抽出（<svg>タグを除去）
			const inner = svgContent
				.replace(/<\?xml[^>]*>/g, "")
				.replace(/<!DOCTYPE[^>]*>/gi, "")
				.replace(/<svg[^>]*>/g, "")
				.replace(/<\/svg>/g, "")
				.trim();

			symbols.push(`\t<symbol id="${id}"${viewBox}>\n\t\t${inner}\n\t</symbol>`);
		}

		const sprite = [
			`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="display:none">`,
			...symbols,
			`</svg>`,
		].join("\n") + "\n";

		// 出力ディレクトリを作成
		await fs.mkdir(path.dirname(ICONS_SPRITE_ABS), { recursive: true });

		const currentContent = await fs.readFile(ICONS_SPRITE_ABS, "utf-8").catch(() => "");
		if (sprite !== currentContent) {
			await fs.writeFile(ICONS_SPRITE_ABS, sprite, "utf-8");
			console.log(`[sass-index] Updated: ${path.relative(process.cwd(), ICONS_SPRITE_ABS)}`);
		}
	} catch (err) {
		if (err.code !== "ENOENT") {
			console.error("[sass-index] Failed to generate icons sprite:", err);
		}
	}
}
