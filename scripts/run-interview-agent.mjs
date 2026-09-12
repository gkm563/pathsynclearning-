import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const cwd = join(root, "agents", "interview");
const py = process.platform === "win32" ? "python" : "python3";

console.log("Starting PathED interviewer worker…");
console.log(`cwd: ${cwd}`);
console.log("Install once: pip install -r agents/interview/requirements.txt");

const child = spawn(py, ["agent.py", "start"], {
  cwd,
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
