import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

import { PNG } from "pngjs";

const run = promisify(execFile);

test("generate-webp-images can resize runtime illustrations", async () => {
  const dir = await mkdtemp(join(tmpdir(), "listen-pick-webp-"));

  try {
    const sourcePath = join(dir, "sample.png");
    const png = new PNG({ width: 100, height: 80 });

    for (let y = 0; y < png.height; y += 1) {
      for (let x = 0; x < png.width; x += 1) {
        const index = (png.width * y + x) << 2;
        png.data[index] = 80 + x;
        png.data[index + 1] = 120 + y;
        png.data[index + 2] = 180;
        png.data[index + 3] = 255;
      }
    }

    await writeFile(sourcePath, PNG.sync.write(png));
    await run("node", [
      "scripts/generate-webp-images.mjs",
      dir,
      "--force",
      "--quality=70",
      "--method=4",
      "--resize=64x48"
    ]);

    const { stdout } = await run("webpinfo", [join(dir, "sample.webp")]);
    assert.match(stdout, /Width:\s+64/);
    assert.match(stdout, /Height:\s+48/);

    const sourceSize = (await readFile(sourcePath)).byteLength;
    const outputSize = (await readFile(join(dir, "sample.webp"))).byteLength;
    assert.ok(outputSize < sourceSize, `expected ${outputSize} to be smaller than ${sourceSize}`);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
