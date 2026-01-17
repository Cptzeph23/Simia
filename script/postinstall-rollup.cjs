const { platform } = require("node:process");
const { execSync } = require("node:child_process");

if (platform === "linux") {
  try {
    execSync(
      "npm install @rollup/rollup-linux-x64-gnu@4.55.1 --no-save --ignore-scripts",
      {
        stdio: "inherit",
      },
    );
  } catch (error) {
    console.error(
      "Failed to install @rollup/rollup-linux-x64-gnu optional dependency",
      error,
    );
  }
}

