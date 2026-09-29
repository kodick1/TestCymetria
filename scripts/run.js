const { spawn } = require("node:child_process");
const path = require("node:path");

const [environment, entrypoint, ...args] = process.argv.slice(2);

if (!environment || !entrypoint) {
	console.error("Uso: node scripts/run.js <environment> <entrypoint> [...args]");
	process.exit(1);
}

const child = spawn(process.execPath, [path.resolve(entrypoint), ...args], {
	stdio: "inherit",
	env: { ...process.env, NODE_ENV: environment },
});

child.on("error", (error) => {
	console.error("No se pudo iniciar la aplicación:", error);
	process.exitCode = 1;
});

child.on("exit", (code, signal) => {
	process.exitCode = code ?? (signal ? 1 : 0);
});
