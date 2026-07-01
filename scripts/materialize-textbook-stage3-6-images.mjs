import { copyFile, mkdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const poolPath = resolve(root, "docs/textbook-image-scene-pool-101-300.json");
const pool = JSON.parse(await readFile(poolPath, "utf8"));

let copied = 0;
let skipped = 0;

for (const scene of pool.scenes) {
  const pngSource = resolve(root, scene.output);
  const webpSource = resolve(root, scene.webp);
  if (!existsSync(pngSource)) {
    skipped += scene.usedBy.length;
    continue;
  }

  for (const usage of scene.usedBy) {
    const pngTarget = resolve(root, usage.image);
    await mkdir(dirname(pngTarget), { recursive: true });
    await copyFile(pngSource, pngTarget);
    copied += 1;

    if (existsSync(webpSource)) {
      const webpTarget = pngTarget.replace(/\.png$/i, ".webp");
      await copyFile(webpSource, webpTarget);
    }
  }
}

console.log(`Materialized stage 3-6 images. copied=${copied} skipped=${skipped}`);
