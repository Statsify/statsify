/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/**
 * Prepares a checkout (the main clone or a linked git worktree) for development.
 *
 * Only uses node builtins because it runs before `pnpm install`.
 *
 * 1. Links `config.json` / `config.js` from the main checkout
 * 2. Checks out each asset submodule at the commit this branch pins, as a git
 *    worktree of the main checkout's submodule repo (no network, no re-clone)
 *    and moves existing clean, detached checkouts to the pinned commit
 * 3. Links the ignored minecraft texture pack from the main checkout
 * 4. Installs dependencies (this also blurs the public backgrounds)
 * 5. Restores the blurred private backgrounds from a cache, or generates them
 * 6. Builds the monorepo
 *
 * Usage: pnpm scripts setup-worktree [--skip-build]
 */

import {
  constants,
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  rmdirSync,
  symlinkSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { execFileSync } from "node:child_process";

// git prints forward slashes on Windows, resolve normalizes them to match COMMON_DIR
const ROOT = resolve(
  git(
    ["rev-parse", "--show-toplevel"],
    resolve(import.meta.dirname, "../../.."),
  ),
);
const COMMON_DIR = resolve(ROOT, git(["rev-parse", "--git-common-dir"], ROOT));
const MAIN_ROOT = dirname(COMMON_DIR);
const IS_LINKED_WORKTREE = MAIN_ROOT !== ROOT;
const CACHE_DIR = join(COMMON_DIR, "statsify-cache");

const TEXTURE_PACK = "assets/public/minecraft-textures/default";
const PRIVATE_ASSETS = "assets/private";

/**
 * @param {string[]} args
 * @param {string} cwd
 * @returns {string}
 */
function git(args, cwd = ROOT) {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

/**
 * @param {string} command
 * @param {string[]} args
 * @param {string} cwd
 */
function run(command, args, cwd = ROOT) {
  execFileSync(command, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
}

/**
 * @param {string} title
 * @param {string} message
 */
function log(title, message) {
  console.log(`\n! ${title} ${message}`);
}

/**
 * Symlinks a file or directory from the main checkout, copying files when symlinks are not permitted.
 * @param {string} path path relative to the repo root
 */
function linkFromMain(path) {
  const source = join(MAIN_ROOT, path);
  const target = join(ROOT, path);

  if (existsSync(target) || !existsSync(source)) return false;

  mkdirSync(dirname(target), { recursive: true });

  try {
    symlinkSync(source, target, "junction");
  } catch {
    cpSync(source, target, { recursive: true });
  }

  return true;
}

function linkConfig() {
  if (!IS_LINKED_WORKTREE) return;

  const linked = ["config.json", "config.js"].filter(linkFromMain);

  if (linked.length > 0)
    log("Config", `linked ${linked.join(", ")} from ${MAIN_ROOT}`);
  else if (
    !["config.json", "config.js"].some((file) => existsSync(join(ROOT, file)))
  )
    log("Config", "missing, copy config.schema.js to config.js and fill it in");
}

/**
 * @returns {string[]}
 */
function submodulePaths() {
  let output;

  try {
    output = git(["config", "--file", ".gitmodules", "--get-regexp", "path"]);
  } catch {
    return [];
  }

  return output.split("\n").map((line) => line.split(" ")[1]);
}

/**
 * Checks that a submodule repo has a commit, fetching it when it is missing.
 * @param {string[]} repo git arguments that select the submodule repo
 * @param {string} sha
 * @returns {boolean} whether the commit is available
 */
function hasCommit(repo, sha) {
  const exists = () => {
    try {
      git([...repo, "cat-file", "-e", `${sha}^{commit}`]);
      return true;
    } catch {
      return false;
    }
  };

  if (exists()) return true;

  try {
    run("git", [...repo, "fetch", "origin"]);
  } catch {
    return false;
  }

  return exists();
}

/**
 * Moves an existing submodule checkout to the commit this branch pins, unless it is
 * on a branch or has local changes.
 * @param {string} path
 * @param {string} sha
 */
function updateSubmodule(path, sha) {
  const target = join(ROOT, path);
  const head = git(["rev-parse", "HEAD"], target);
  if (head === sha) return;

  let onBranch = true;

  try {
    git(["symbolic-ref", "-q", "HEAD"], target);
  } catch {
    onBranch = false;
  }

  if (onBranch || git(["status", "--porcelain"], target) !== "") {
    log(
      "Submodule",
      `${path} is at ${head.slice(0, 8)} but this branch pins ${sha.slice(0, 8)}, leaving it because it is on a branch or has local changes`,
    );
    return;
  }

  if (!hasCommit(["-C", target], sha)) {
    log("Submodule", `could not fetch ${path} at ${sha.slice(0, 8)}`);
    return;
  }

  git(["checkout", "--detach", sha], target);
  log("Submodule", `updated ${path} to ${sha.slice(0, 8)}`);
}

/**
 * @param {string} path
 */
function setupSubmodule(path) {
  const target = join(ROOT, path);
  const sha = git(["ls-tree", "HEAD", path]).split(/\s+/)[2];
  if (!sha) return;

  if (existsSync(join(target, ".git"))) return updateSubmodule(path, sha);

  const moduleDir = join(COMMON_DIR, "modules", path);

  if (!IS_LINKED_WORKTREE || !existsSync(moduleDir)) {
    try {
      run("git", ["submodule", "update", "--init", path]);
    } catch {
      log("Submodule", `could not clone ${path}, continuing without it`);
    }

    return;
  }

  if (!hasCommit(["--git-dir", moduleDir], sha)) {
    log("Submodule", `could not fetch ${path}, continuing without it`);
    return;
  }

  // Worktrees that were deleted without `git worktree remove` leave stale entries behind
  git(["--git-dir", moduleDir, "worktree", "prune"]);

  if (existsSync(target) && readdirSync(target).length === 0) rmdirSync(target);
  git(["--git-dir", moduleDir, "worktree", "add", "--detach", target, sha]);

  log("Submodule", `checked out ${path} at ${sha.slice(0, 8)}`);
}

function linkTexturePack() {
  if (IS_LINKED_WORKTREE && linkFromMain(TEXTURE_PACK))
    log("Textures", `linked ${TEXTURE_PACK}`);

  if (!existsSync(join(ROOT, TEXTURE_PACK)))
    log("Textures", `missing, add a 1.8.9 texture pack to ${TEXTURE_PACK}`);
}

/**
 * The blur output only depends on the backgrounds and the blur script, so it is cached
 * by their git object ids. Uncommitted changes to either always regenerate.
 */
function blurPrivateBackgrounds() {
  const assets = join(ROOT, PRIVATE_ASSETS);
  if (!existsSync(join(assets, "package.json"))) return;

  const output = join(assets, "out", "backgrounds");
  const dirty =
    git(["status", "--porcelain", "--", "backgrounds", "blur.mjs"], assets) !==
    "";

  const key = dirty
    ? undefined
    : `${git(["rev-parse", "HEAD:backgrounds"], assets)}-${git(["rev-parse", "HEAD:blur.mjs"], assets)}`;

  const cached = key && join(CACHE_DIR, "blurred-backgrounds", key);

  if (cached && existsSync(cached)) {
    rmSync(output, { recursive: true, force: true });
    // Copy on write where the filesystem supports it, so restoring costs no extra disk space
    cpSync(cached, output, {
      recursive: true,
      mode: constants.COPYFILE_FICLONE,
    });
    log("Backgrounds", `restored from cache ${relative(MAIN_ROOT, cached)}`);
    return;
  }

  log("Backgrounds", "blurring private backgrounds, this takes a while");
  run("pnpm", ["blur"], assets);

  if (!cached) return;

  rmSync(join(CACHE_DIR, "blurred-backgrounds"), {
    recursive: true,
    force: true,
  });
  cpSync(output, cached, { recursive: true, mode: constants.COPYFILE_FICLONE });
  log("Backgrounds", "cached for future checkouts");
}

log(
  "Setup",
  `${ROOT}${IS_LINKED_WORKTREE ? ` (worktree of ${MAIN_ROOT})` : ""}`,
);

linkConfig();
for (const path of submodulePaths()) setupSubmodule(path);
linkTexturePack();

run("pnpm", ["install", "--frozen-lockfile"]);

blurPrivateBackgrounds();

if (!process.argv.includes("--skip-build")) run("pnpm", ["build"]);

log("Setup", "done");
