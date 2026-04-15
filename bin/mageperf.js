#!/usr/bin/env node
const { execSync, spawnSync } = require("child_process");

function hasPython() {
  try {
    execSync("python3 --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function hasPackage() {
  try {
    execSync("mageperf --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

if (!hasPython()) {
  console.error("Error: Python 3.11+ is required. Install from https://python.org");
  process.exit(1);
}

if (!hasPackage()) {
  console.log("Installing easecloud-mageperf...");
  execSync("pip3 install easecloud-mageperf", { stdio: "inherit" });
}

const result = spawnSync("mageperf", process.argv.slice(2), { stdio: "inherit" });
process.exit(result.status ?? 0);
