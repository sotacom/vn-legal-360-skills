#!/usr/bin/env node
/**
 * One-Command Setup Script for VN Legal 360° Intelligence Skills Suite
 *
 * Actions:
 * 1. Clones and builds `https://github.com/goodnight000/api-anything.git` into `./api-anything` (if not present).
 * 2. Installs `specs/vbpl.json` into `~/.api-anything/sites/vbpl.json`.
 * 3. Symlinks all 5 skills from `.agents/skills/*` into `~/.gemini/config/skills/` (if `~/.gemini/config` exists).
 */
import { execSync } from "node:child_process";
import { copyFileSync, existsSync, lstatSync, mkdirSync, readdirSync, symlinkSync, unlinkSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, "..");
const API_ANYTHING_DIR = join(ROOT_DIR, "api-anything");
const SPEC_SRC = join(ROOT_DIR, "specs", "vbpl.json");
const SPEC_DEST_DIR = join(homedir(), ".api-anything", "sites");
const SPEC_DEST = join(SPEC_DEST_DIR, "vbpl.json");
const SKILLS_SRC_DIR = join(ROOT_DIR, ".agents", "skills");
const GLOBAL_SKILLS_DIR = join(homedir(), ".gemini", "config", "skills");

function main() {
  console.log("=== [1/3] Checking api-anything engine ===");
  if (!existsSync(join(API_ANYTHING_DIR, "dist", "index.js"))) {
    if (!existsSync(API_ANYTHING_DIR)) {
      console.log("Cloning https://github.com/goodnight000/api-anything.git ...");
      execSync("git clone https://github.com/goodnight000/api-anything.git api-anything", {
        cwd: ROOT_DIR,
        stdio: "inherit"
      });
    }
    console.log("Installing & building api-anything ...");
    execSync("npm install && npm run build", {
      cwd: API_ANYTHING_DIR,
      stdio: "inherit"
    });
  } else {
    console.log("✓ api-anything is already built at ./api-anything/dist/index.js");
  }

  console.log("\n=== [2/3] Installing VBPL Tier-1 Site Spec ===");
  mkdirSync(SPEC_DEST_DIR, { recursive: true });
  copyFileSync(SPEC_SRC, SPEC_DEST);
  console.log(`✓ Installed specs/vbpl.json -> ${SPEC_DEST}`);

  console.log("\n=== [3/3] Linking 5 VN Legal Skills ===");
  mkdirSync(GLOBAL_SKILLS_DIR, { recursive: true });
  const skills = readdirSync(SKILLS_SRC_DIR).filter((name) =>
    existsSync(join(SKILLS_SRC_DIR, name, "SKILL.md"))
  );

  for (const skillName of skills) {
    const srcPath = join(SKILLS_SRC_DIR, skillName);
    const destPath = join(GLOBAL_SKILLS_DIR, skillName);
    try {
      const st = lstatSync(destPath);
      if (st.isSymbolicLink() || st.isFile()) {
        unlinkSync(destPath);
      }
    } catch {
      // Destination does not exist yet
    }
    if (!existsSync(destPath)) {
      symlinkSync(srcPath, destPath, "dir");
    }
    console.log(`✓ Linked skill: ${skillName} -> ${destPath}`);
  }

  console.log("\n🎉 Setup complete! All 5 skills and VBPL engine are ready.");
}

main();
