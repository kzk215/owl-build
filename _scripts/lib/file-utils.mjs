import path from "node:path";
import fs from "node:fs/promises";
/* =========================
 * Utils
 * ========================= */
export async function ensureDir(dir) {
	await fs.mkdir(dir, {recursive: true});
}

export async function exists(p) {
	try {
		await fs.access(p);
		return true;
	} catch {
		return false;
	}
}

export async function copyFileSafe(src, dst) {
	if (!(await exists(src))) {
		console.warn("[copy] missing:", src);
		return false;
	}
	await ensureDir(path.dirname(dst));
	await fs.copyFile(src, dst);
	return true;
}