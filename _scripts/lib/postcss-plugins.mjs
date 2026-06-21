/* =========================
 * PostCSS mini plugins
 * ========================= */

import fs from "node:fs/promises";


export const dedupeDecls = () => {
	return {
		postcssPlugin: "dedupe-decls",
		Once(root) {
			const seen = new Set();
			root.walkDecls((decl) => {
				const key = `${decl.parent.selector}|${decl.prop}`;
				if (seen.has(key)) {
					decl.remove();
				} else {
					seen.add(key);
				}
			});
		},
	};
};
dedupeDecls.postcss = true;

export const addCharset = () => {
	return {
		postcssPlugin: "add-charset",
		OnceExit(root) {
			const charsetRule = root.nodes.find(
				(node) => node.type === "atrule" && node.name === "charset"
			);
			if (!charsetRule) {
				root.insertBefore(root.nodes[0], {
					type: "atrule",
					name: "charset",
					params: '"UTF-8"',
				});
			}
		},
	};
};
addCharset.postcss = true;

export const stripImageUrls = () => {
	return {
		postcssPlugin: 'strip-image-urls',
		Declaration(decl) {
			if (decl.prop === 'background-image' && decl.value.includes('url(')) {
				// background-image プロパティを削除
				decl.remove();
			}
		}
	};
};
stripImageUrls.postcss = true;
