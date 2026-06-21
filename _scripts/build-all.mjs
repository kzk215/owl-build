// _scripts/build-all.mjs
// 全ターゲット（または指定ターゲット）を順次ビルド、または並列 watch するスクリプト
import { execSync, spawn } from "node:child_process";
import { TARGETS } from "../paths.mjs";

const mode = process.env.MODE ?? "development";
const watch = process.env.WATCH === "1";

console.log(`ビルドターゲット: ${TARGETS.join(", ")} [mode: ${mode}]${watch ? " [watch]" : ""}`);

if (watch) {
	// 複数ターゲットを並列 watch
	const procs = TARGETS.map((t) => {
		const env = { ...process.env, TARGET: t };
		const args = ["vite", "build", "--watch", "--mode", mode];
		const proc = spawn("npx", args, { stdio: "inherit", shell: false, env });
		proc.on("exit", (code) => {
			if (code !== 0 && code !== null) {
				console.error(`[${t}] exited with code ${code}`);
				process.exit(code);
			}
		});
		return proc;
	});

	process.on("SIGINT", () => {
		procs.forEach((p) => p.kill("SIGINT"));
		process.exit(0);
	});
	process.on("SIGTERM", () => {
		procs.forEach((p) => p.kill("SIGTERM"));
		process.exit(0);
	});
} else {
	// 順次ビルド
	for (const target of TARGETS) {
		console.log(`\n▶ ${target} ビルド開始...`);
		execSync(`npx vite build --mode ${mode}`, {
			stdio: "inherit",
			env: { ...process.env, TARGET: target },
		});
		console.log(`✔ ${target} ビルド完了`);
	}
}
