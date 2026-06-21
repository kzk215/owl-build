import path from "node:path";
import fs from "node:fs/promises";
import { ensureDir } from "./file-utils.mjs";
import { writeSassOutput } from "./sass-utils.mjs";
import * as sass from "sass";
import { CSS_ABS, CSS_REL, SCSS_ABS } from "../../paths.mjs";


/* =========================
 * Vite Plugins
 * ========================= */

export function generateSassSourcemap() {
	let isProd = false;

	return {
		name: "generate-sass-sourcemap",
		apply: "build",

		configResolved(config) {
			isProd = config.mode === "production";
		},

		async closeBundle() {
			const scssEntry = path.resolve(SCSS_ABS, "app.scss");
			const cssOutput = path.resolve(CSS_ABS, "app.css");

			try {
				const result = sass.compile(scssEntry, {
					sourceMap: true,
					style: isProd ? "compressed" : "expanded",
					loadPaths: [SCSS_ABS],
				});

				await ensureDir(path.dirname(cssOutput));
				const css = await writeSassOutput(result, cssOutput, CSS_REL);
				await fs.writeFile(cssOutput, css);
			} catch (err) {
				console.error("[sass] failed:", err);
			}
		},
	};
}


export function deleteImages() {
	return {
		name: "delete-images",
		apply: "build",
		async closeBundle() {
			try {
				// assets 配下のすべてのファイルを走査
				const walk = async (dir) => {
					const entries = await fs.readdir(dir, { withFileTypes: true });

					for (const entry of entries) {
						const fullPath = path.join(dir, entry.name);

						if (entry.isDirectory()) {
							// 除外ディレクトリは除外
							if (entry.name !== EXCLUDE_IMG_DIR) {
								await walk(fullPath);
							}
						} else if (/\.(png|jpg|jpeg|gif|svg|webp)$/i.test(entry.name)) {
							// 画像ファイルを削除
							await fs.unlink(fullPath);
							console.log(`[delete] ${path.relative(ASSETS_ABS, fullPath)}`);
						}
					}
				};

				await walk(ASSETS_ABS);
			} catch (err) {
				if (err.code !== 'ENOENT') {
					console.error("[delete] failed:", err);
				}
			}
		},
	};
}
