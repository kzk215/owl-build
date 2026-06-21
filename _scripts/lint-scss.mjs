// _scripts/lint-scss.mjs
import { execSync } from "node:child_process";
import { STYLELINT_GLOB } from "../paths.mjs";

try {
	console.log("Linting:", STYLELINT_GLOB);
	const result = execSync(`npx stylelint "${STYLELINT_GLOB}"`, {
		encoding: "utf-8",
		stdio: ["pipe", "pipe", "pipe"]
	});
	console.log(result);
	console.log("✓ stylelint completed successfully");
} catch (error) {
	console.error("✗ stylelint output:");
	console.error(error.stdout);
	console.error(error.stderr);
	console.error("Status:", error.status);
	process.exit(error.status);
}

