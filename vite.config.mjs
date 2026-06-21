// vite.config.mjs
import {defineConfig} from "vite";
import path from "node:path";
import {dedupeDecls, addCharset, stripImageUrls} from "./_scripts/lib/postcss-plugins.mjs";
import {generateSassSourcemap} from "./_scripts/lib/vite-plugins.mjs";
import autoprefixer from "autoprefixer";
import sortMediaQueries from "postcss-sort-media-queries";
import cssnano from "cssnano";

import {TARGETS, EXCLUDE_IMG_DIR, resolveTargetPaths} from "./_scripts/paths.mjs";

/* =========================
 * Rollup Output Config
 * ========================= */

const toPosix = (p) => (typeof p === "string" ? p.split(path.sep).join("/") : "");

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const makeAssetsImgMatcher = (ASSETS_REL) => {
	const prefix = `${ASSETS_REL}/${EXCLUDE_IMG_DIR}/`;
	return new RegExp(`${escapeRegExp(prefix)}(.+)$`);
};

const makeRollupOutput = (paths) => {
	const ASSETS_IMG_MATCHER = makeAssetsImgMatcher(paths.ASSETS_REL);
	const { OUT, JS_REL } = paths;

	return {
		assetFileNames: (assetInfo) => {
			const names = [assetInfo.name, ...(assetInfo.names ?? [])].filter(Boolean);

			if (names.some((n) => n.endsWith(".css"))) return OUT.cssFile;
			if (names.some((n) => n.endsWith(".css.map"))) return `${OUT.cssFile}.map`;

			// 画像は「元の assets/img/... の階層」を維持して assets/img/... に出す
			if (names.some((n) => /\.(png|jpe?g|gif|svg|webp)$/i.test(n))) {
				const original = toPosix(assetInfo.originalFileName);
				const m = original.match(ASSETS_IMG_MATCHER);

				// outDir が "src/gojoh/assets" なので、返すのは "img/..."（= EXCLUDE_IMG_DIR/..）でOK
				if (m) return `${EXCLUDE_IMG_DIR}/${m[1]}`;

				// 万一 originalFileName が無い/想定外のとき
				return `${EXCLUDE_IMG_DIR}/${assetInfo.name}`;
			}

			return OUT.cssAssets;
		},

		entryFileNames: OUT.jsEntry,

		sourcemapPathTransform: (relativeSourcePath) => {
			const match = relativeSourcePath.match(new RegExp(`${JS_REL}/(.+)$`));
			return match ? `./${match[1]}` : relativeSourcePath;
		},
	};
};

export default defineConfig(({mode}) => {
	const isProd = mode === "production";
	const isWatch = process.env.WATCH === "1";

	const postcssPlugins = [
		autoprefixer(),
		sortMediaQueries({sort: "desktop-first"}),
		stripImageUrls(),
		addCharset(),
		!isProd && dedupeDecls(),
		isProd && cssnano({preset: "default"}),
	].filter(Boolean);

	// TARGETS が複数の場合は先頭ターゲットを使用（複数ビルドは _scripts/build-all.mjs で実行）
	const targetName = TARGETS[0];
	const paths = resolveTargetPaths(targetName);

	return {
		plugins: [generateSassSourcemap()],

		css: {
			preprocessorOptions: {scss: {api: "modern-compiler"}},
			postcss: {plugins: postcssPlugins},
			devSourcemap: true,
		},

		build: {
			outDir: paths.ASSETS_ABS,
			assetsInlineLimit: 1000000,
			emptyOutDir: false,
			sourcemap: paths.sourcemap ?? true,
			minify: paths.minify ?? isProd,
			watch: isWatch ? {exclude: [paths.ASSETS_ABS + "/**"]} : null,
			rollupOptions: {
				input: {app: paths.ENTRY.js},
				output: makeRollupOutput(paths),
			},
		},
	};
});
