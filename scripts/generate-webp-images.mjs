import { readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { execFile } from "node:child_process";

const run = promisify(execFile);
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const args = process.argv.slice(2);
const sourceDirs = args.filter((arg) => !arg.startsWith("--"));
const dirs = sourceDirs.length > 0 ? sourceDirs : ["assets/textbook/images", "assets/course/images"];
const quality = readOption("--quality") ?? "78";
const method = readOption("--method") ?? "5";
const force = args.includes("--force");
const cwebp = "cwebp";

let converted = 0;
let skipped = 0;

for (const dir of dirs) {
  const absoluteDir = resolve(root, dir);
  if (!existsSync(absoluteDir)) continue;

  for (const file of await listPngFiles(absoluteDir)) {
    const output = file.replace(/\.png$/i, ".webp");
    if (!force && existsSync(output)) {
      skipped += 1;
      continue;
    }

    await run(cwebp, ["-quiet", "-q", quality, "-m", method, file, "-o", output]);
    converted += 1;
    if (converted % 100 === 0) {
      console.log(`Converted ${converted} WebP images...`);
    }
  }
}

console.log(`WebP conversion complete. converted=${converted} skipped=${skipped}`);

async function listPngFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listPngFiles(absolutePath));
      continue;
    }

    if (entry.isFile() && extname(entry.name).toLowerCase() === ".png") {
      const info = await stat(absolutePath);
      if (info.size > 0) files.push(absolutePath);
    }
  }

  return files;
}

function readOption(name) {
  const direct = args.find((arg) => arg.startsWith(`${name}=`));
  if (direct) return direct.slice(name.length + 1);

  const index = args.indexOf(name);
  if (index >= 0) return args[index + 1];
  return null;
}
