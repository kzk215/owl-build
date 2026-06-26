#!/usr/bin/env node

/**
 * HTML コンポーネント集 (catalog) をテンプレートリポジトリから任意取得する。
 *
 * 使い方:
 *   npm run pull-catalog
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { TARGETS_CONFIG, resolveTargetPaths } from '../paths.mjs';

const TEMPLATE_REPO_URL = 'https://github.com/kzk215/owl-build.git';
const TEMPLATE_CATALOG_REL = 'src/catalog';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

/**
 * @param {string} src
 * @param {string} dest
 * @param {string[]} excludeFiles
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
			copyRecursiveSync(
				path.join(src, childItemName),
				path.join(dest, childItemName),
				excludeFiles
			);
		});
	} else {
		const destDir = path.dirname(dest);
		if (!fs.existsSync(destDir)) {
			fs.mkdirSync(destDir, { recursive: true });
		}
		fs.copyFileSync(src, dest);
	}
}

function resolveDestinations() {
	return TARGETS_CONFIG.map((config) => {
		const { SOURCES_REL } = resolveTargetPaths(config.name);
		const srcRoot = path.dirname(SOURCES_REL);
		return path.join(ROOT, srcRoot, 'catalog');
	});
}

function run() {
	const destinations = resolveDestinations();

	for (const dest of destinations) {
		if (fs.existsSync(dest)) {
			console.error(`Already exists: ${path.relative(ROOT, dest)}`);
			process.exit(1);
		}
	}

	const templateDir = path.join(ROOT, '.owl-build-temp');

	try {
		console.log(`Cloning template repository from ${TEMPLATE_REPO_URL}...`);
		if (fs.existsSync(templateDir)) {
			fs.rmSync(templateDir, { recursive: true, force: true });
		}
		execSync(`git clone --depth 1 ${TEMPLATE_REPO_URL} "${templateDir}"`, { stdio: 'inherit' });

		const sourceDir = path.join(templateDir, TEMPLATE_CATALOG_REL);
		if (!fs.existsSync(sourceDir)) {
			console.error(`Template catalog not found: ${sourceDir}`);
			process.exit(1);
		}

		for (const dest of destinations) {
			copyRecursiveSync(sourceDir, dest);
			console.log(`Copied to ${path.relative(ROOT, dest)}`);
		}

		fs.rmSync(templateDir, { recursive: true, force: true });
		console.log('\nHTML component catalog is ready.');
	} catch (err) {
		console.error('Error during pull-catalog:', err.message);
		if (fs.existsSync(templateDir)) {
			fs.rmSync(templateDir, { recursive: true, force: true });
		}
		process.exit(1);
	}
}

run();
