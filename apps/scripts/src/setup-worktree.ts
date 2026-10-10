/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/**
 * Prepares a checkout (the main clone or a linked git worktree) for development.
 * T3 Code runs it when it creates a worktree (see t3.json).
 *
 * Only uses node builtins because it runs before `pnpm install`. Node runs it as
 * TypeScript by stripping the types, so it only uses erasable syntax.
 *
 * 1. Links `config.js` from the main checkout
 * 2. Checks out each asset submodule at the commit this branch pins, as a git
 *    worktree of the main checkout's submodule repo (no re-clone), and moves
 *    existing clean, detached checkouts to the pinned commit. In a worktree, a
 *    submodule the main checkout hasn't set up is skipped instead of cloned
 * 3. Links the ignored minecraft texture pack from the main checkout
 * 4. Installs dependencies (this also blurs the public backgrounds)
 * 5. Restores the blurred private backgrounds from a cache shared by all
 *    checkouts, or generates and caches them
 * 6. Builds the monorepo. turbo stores the cache of every linked worktree in the
 *    main checkout's .turbo/cache, so this is mostly cache hits
 *
 * Safe to run in many new worktrees at once: cache entries are written to a
 * temporary folder and renamed into place, restores are checked against the
 * backgrounds in git, and fetches that lose a lock race are retried.
 *
 * Usage: node apps/scripts/src/setup-worktree.ts [--skip-build]
 */

import {
  constants,
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  rmdirSync,
  statSync,
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
const BLUR_CACHE_DIR = join(
  COMMON_DIR,
  "statsify-cache",
  "blurred-backgrounds",
);

const STALE_TEMP_MS = 60 * 60 * 1000;

const TEXTURE_PACK = "assets/public/minecraft-textures/default";
const PUBLIC_ASSETS = "assets/public";
// Packages blur.mjs uses to decode, blur, and encode the backgrounds
const BLUR_DEPENDENCIES = ["skia-canvas", "stackblur-canvas"];
const PRIVATE_ASSETS = "assets/private";

function git(args: string[], cwd = ROOT): string {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function run(command: string, args: string[], cwd = ROOT) {
  execFileSync(command, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
}

function log(title: string, message: string) {
  console.log(`\n! ${title} ${message}`);
}

/**
 * Symlinks a file or directory from the main checkout, copying it when symlinks are not permitted.
 * @param path path relative to the repo root
 */
function linkFromMain(path: string): boolean {
  const source = join(MAIN_ROOT, path);
  const target = join(ROOT, path);

  if (existsSync(target) || !existsSync(source)) return false;

  mkdirSync(dirname(target), { recursive: true });

  try {
    // Windows junctions only work for directories, and need no extra permissions.
    // A file symlink needs Developer Mode or admin rights, so it falls back to a copy
    symlinkSync(
      source,
      target,
      statSync(source).isDirectory() ? "junction" : "file",
    );
  } catch {
    cpSync(source, target, { recursive: true });
  }

  return true;
}

/**
 * Only config.js is linked. The loader tries config.json first, but loads it with a
 * plain import(), which node rejects for JSON files.
 */
function linkConfig() {
  if (!IS_LINKED_WORKTREE) return;

  if (linkFromMain("config.js"))
    log("Config", `linked config.js from ${MAIN_ROOT}`);
  else if (!existsSync(join(ROOT, "config.js")))
    log("Config", "missing, copy config.schema.js to config.js and fill it in");
}

interface Submodule {
  /** git stores the submodule's repo under .git/modules/<name> */
  name: string;
  path: string;
}

function submodules(): Submodule[] {
  let output: string;

  try {
    output = git([
      "config",
      "--file",
      ".gitmodules",
      "--get-regexp",
      String.raw`^submodule\..*\.path$`,
    ]);
  } catch {
    return [];
  }

  // Lines look like `submodule.<name>.path <path>`, and names can contain dots
  return output.split("\n").map((line) => {
    const [key, path] = line.split(" ");
    return { name: key.slice("submodule.".length, -".path".length), path };
  });
}

/**
 * Checks that a submodule repo has a commit, fetching it when it is missing.
 * @param repo git arguments that select the submodule repo
 * @returns whether the commit is available
 */
function hasCommit(repo: string[], sha: string): boolean {
  const exists = () => {
    try {
      git([...repo, "cat-file", "-e", `${sha}^{commit}`]);
      return true;
    } catch {
      return false;
    }
  };

  if (exists()) return true;

  // Concurrent setups fetching the same submodule repo can fail to lock refs,
  // so check whether the other fetch brought the commit in and retry once
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      run("git", [...repo, "fetch", "origin"]);
    } catch {
      // Checked below
    }

    if (exists()) return true;
  }

  return false;
}

/**
 * Moves an existing submodule checkout to the commit this branch pins, unless it is
 * on a branch or has local changes.
 */
function updateSubmodule(path: string, sha: string) {
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

function setupSubmodule({ name, path }: Submodule) {
  const target = join(ROOT, path);
  // Read the pinned commit from the index like `git submodule update` does, so a
  // staged but uncommitted submodule bump isn't undone. Lines look like
  // `160000 <sha> 0\t<path>`
  const sha = git(["ls-files", "--stage", "--", path]).split(/\s+/)[1];
  if (!sha) return;

  if (existsSync(join(target, ".git"))) {
    try {
      updateSubmodule(path, sha);
    } catch {
      log(
        "Submodule",
        `could not update ${path}, continuing with it as is. If it is broken in a worktree, delete ${path} and rerun setup`,
      );
    }

    return;
  }

  if (!IS_LINKED_WORKTREE) {
    try {
      run("git", ["submodule", "update", "--init", path]);
    } catch {
      log("Submodule", `could not clone ${path}, continuing without it`);
    }

    return;
  }

  // Cloning here would put a full copy in this worktree's own git dir, so every
  // worktree would clone it again, and a private repo can hang on a credential prompt
  const moduleDir = join(COMMON_DIR, "modules", name);

  if (!existsSync(moduleDir)) {
    log(
      "Submodule",
      `${path} isn't set up in the main checkout, continuing without it. Run \`git submodule update --init ${path}\` there to share it with worktrees`,
    );
    return;
  }

  if (!hasCommit(["--git-dir", moduleDir], sha)) {
    log("Submodule", `could not fetch ${path}, continuing without it`);
    return;
  }

  // Worktrees that were deleted without `git worktree remove` leave stale entries
  // behind. git locks worktrees while it adds them, so this can't remove one that a
  // concurrent setup is still creating
  try {
    git(["--git-dir", moduleDir, "worktree", "prune"]);
  } catch {
    // Only housekeeping
  }

  if (existsSync(target) && readdirSync(target).length === 0) rmdirSync(target);

  try {
    git(["--git-dir", moduleDir, "worktree", "add", "--detach", target, sha]);
  } catch {
    log(
      "Submodule",
      `could not check out ${path}, continuing without it. If ${path} has leftover files, delete it and rerun setup`,
    );
    return;
  }

  log("Submodule", `checked out ${path} at ${sha.slice(0, 8)}`);
}

function linkTexturePack() {
  // Linking into a public assets folder that isn't checked out would create it and
  // block checking out the submodule there on the next run
  const publicAssets = join(ROOT, PUBLIC_ASSETS, ".git");

  if (
    IS_LINKED_WORKTREE &&
    existsSync(publicAssets) &&
    linkFromMain(TEXTURE_PACK)
  )
    log("Textures", `linked ${TEXTURE_PACK}`);

  if (!existsSync(join(ROOT, TEXTURE_PACK)))
    log("Textures", `missing, add a 1.8.9 texture pack to ${TEXTURE_PACK}`);
}

/**
 * @param backgrounds file names of the tracked backgrounds
 * @returns whether `output` has a blurred file for every background
 */
function isComplete(output: string, backgrounds: string[]): boolean {
  if (!existsSync(output)) return false;

  const blurred = new Set(readdirSync(output));
  return backgrounds.every((background) => blurred.has(background));
}

/**
 * Copies a cache entry to `output` and checks that every background made it, since
 * another setup can evict the entry while it is being copied.
 * @param backgrounds file names of the tracked backgrounds
 * @returns whether the restore is complete
 */
function restoreBlurCache(
  entry: string,
  output: string,
  backgrounds: string[],
): boolean {
  try {
    rmSync(output, { recursive: true, force: true });
    // Copy on write where the filesystem supports it, so restoring costs no extra disk space
    cpSync(entry, output, {
      recursive: true,
      mode: constants.COPYFILE_FICLONE,
    });
  } catch {
    return false;
  }

  return isComplete(output, backgrounds);
}

/**
 * Stores `output` as the cache entry for `key` and evicts the entries that were there
 * before it. The entry is copied to a temporary folder and renamed into place, so
 * concurrent setups never see a partial entry.
 *
 * Only entries listed before the rename are evicted. Two setups can't evict each other,
 * since each would have to list the cache after the other's rename, so the most recently
 * stored entry always survives. A setup that finds its key already stored evicts nothing.
 * Temporary folders older than an hour are left over from crashed setups and evicted too.
 * @returns whether this call stored the entry
 */
function storeBlurCache(
  cacheDir: string,
  key: string,
  output: string,
): boolean {
  const entry = join(cacheDir, key);
  const temp = `${entry}.tmp-${process.pid}`;
  let previous: string[];

  // The cache is optional, so failing to write it (a full disk, an unwritable .git)
  // must not stop setup
  try {
    mkdirSync(cacheDir, { recursive: true });
    cpSync(output, temp, { recursive: true, mode: constants.COPYFILE_FICLONE });
    previous = readdirSync(cacheDir);
  } catch {
    log("Backgrounds", "could not write the blur cache, continuing without it");
    rmSync(temp, { recursive: true, force: true });
    return false;
  }

  try {
    renameSync(temp, entry);
  } catch {
    // Another setup already stored this key
    rmSync(temp, { recursive: true, force: true });
    return false;
  }

  for (const name of previous) {
    if (name === key) continue;

    const path = join(cacheDir, name);

    try {
      // A fresh temporary folder belongs to a setup that is still copying. Copying
      // keeps updating its mtime, so an old one was left behind by a crashed setup
      if (
        name.includes(".tmp-") &&
        Date.now() - statSync(path).mtimeMs < STALE_TEMP_MS
      )
        continue;

      rmSync(path, { recursive: true, force: true });
    } catch {
      // Another setup is evicting it too, or it was this setup's temporary folder
    }
  }

  return true;
}

/**
 * @returns `<name>@<version>` of a package installed in `dir`, or undefined when it
 * isn't installed
 */
function installedVersion(dir: string, name: string): string | undefined {
  try {
    const manifest = JSON.parse(
      readFileSync(join(dir, "node_modules", name, "package.json"), "utf8"),
    ) as { version: string };

    return `${name}@${manifest.version}`;
  } catch {
    return undefined;
  }
}

/**
 * The blur output only depends on the backgrounds, the blur script, and the installed
 * versions of the packages that decode, blur, and encode the images. It is cached by
 * the git object ids of the first two and those versions. Uncommitted changes to the
 * backgrounds or blur script always regenerate.
 */
function blurPrivateBackgrounds() {
  const assets = join(ROOT, PRIVATE_ASSETS);
  if (!existsSync(join(assets, "package.json"))) return;

  const output = join(assets, "out", "backgrounds");
  const dirty =
    git(["status", "--porcelain", "--", "backgrounds", "blur.mjs"], assets) !==
    "";

  const versions = BLUR_DEPENDENCIES.map((name) =>
    installedVersion(assets, name),
  );

  const key =
    dirty || versions.includes(undefined)
      ? undefined
      : [
          git(["rev-parse", "HEAD:backgrounds"], assets),
          git(["rev-parse", "HEAD:blur.mjs"], assets),
          ...versions,
        ].join("-");

  const cached = key && join(BLUR_CACHE_DIR, key);

  // blur.mjs writes one output per background, with the same name. Only tracked
  // backgrounds are part of the key, so ignored files like .DS_Store don't count
  const backgrounds = key
    ? git(["ls-tree", "--name-only", "HEAD:backgrounds"], assets).split("\n")
    : [];

  if (cached && existsSync(cached)) {
    if (restoreBlurCache(cached, output, backgrounds)) {
      log("Backgrounds", `restored from cache ${relative(MAIN_ROOT, cached)}`);
      return;
    }

    // Either evicted while it was being copied, or stored incomplete. Delete it, or an
    // incomplete entry could never be replaced
    log("Backgrounds", "cache entry is incomplete, replacing it");
    rmSync(cached, { recursive: true, force: true });
  }

  log("Backgrounds", "blurring private backgrounds, this takes a while");
  run("pnpm", ["blur"], assets);

  if (!key) return;

  if (!isComplete(output, backgrounds)) {
    log("Backgrounds", "blur output is incomplete, not caching it");
    return;
  }

  if (storeBlurCache(BLUR_CACHE_DIR, key, output))
    log("Backgrounds", "cached for future checkouts");
}

log(
  "Setup",
  `${ROOT}${IS_LINKED_WORKTREE ? ` (worktree of ${MAIN_ROOT})` : ""}`,
);

linkConfig();
for (const submodule of submodules()) setupSubmodule(submodule);
linkTexturePack();

run("pnpm", ["install", "--frozen-lockfile"]);

// The backgrounds are only needed when an app renders, so a failed blur must not
// stop the build that every package import depends on
try {
  blurPrivateBackgrounds();
} catch {
  log(
    "Backgrounds",
    "could not blur the private backgrounds, continuing without them. Rerun setup to retry",
  );
}

if (!process.argv.includes("--skip-build")) run("pnpm", ["build"]);

log("Setup", "done");
