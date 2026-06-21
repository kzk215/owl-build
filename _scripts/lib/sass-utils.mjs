import path from "node:path";
import fs from "node:fs/promises";
import { ensureDir} from "./file-utils.mjs";


/* =========================
 * Sass utilities
 * ========================= */

export function cleanSourceMapComment(css) {
	return css.replace(/\/\*# sourceMappingURL=.*?\*\/\s*$/, "");
}

export function processSourcePath(src, cssDir) {
	let filePath = src;
	if (src.startsWith("file://")) {
		filePath = src.replace(/^file:\/\//, "");
	}

	if (path.isAbsolute(filePath)) {
		const relativePath = path.relative(path.dirname(cssDir), filePath);
		return "../" + relativePath;
	}

	return filePath;
}

export async function writeSassOutput(result, cssOutput, cssDir) {
	if (!result.sourceMap) return result.css.toString();

	let css = result.css.toString();
	css = cleanSourceMapComment(css);

	const mapOutput = `${cssOutput}.map`;
	const mapData = {
		...result.sourceMap,
		sources: result.sourceMap.sources.map((src) =>
			processSourcePath(src, cssDir)
		),
	};

	await ensureDir(path.dirname(mapOutput));
	await fs.writeFile(mapOutput, JSON.stringify(mapData, null, 2));
	css += `\n/*# sourceMappingURL=${path.basename(cssOutput)}.map */`;

	return css;
}
