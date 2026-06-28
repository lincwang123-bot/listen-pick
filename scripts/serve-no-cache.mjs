#!/usr/bin/env node
import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const defaultHost = "127.0.0.1";

const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".ico", "image/x-icon"],
  [".m4a", "audio/mp4"],
  [".mp3", "audio/mpeg"],
  [".wav", "audio/wav"],
]);

export function getNoCacheHeaders() {
  return {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
    Pragma: "no-cache",
    Expires: "0",
  };
}

export function getContentType(filePath) {
  return contentTypes.get(extname(filePath).toLowerCase()) ?? "application/octet-stream";
}

export function resolveRequestPath(pathname, rootDir = process.cwd()) {
  const rootPath = resolve(rootDir);
  let decodedPath;

  try {
    decodedPath = decodeURIComponent(pathname.split("?")[0] || "/");
  } catch {
    return null;
  }

  if (!decodedPath.startsWith("/")) {
    decodedPath = `/${decodedPath}`;
  }

  if (decodedPath.split("/").includes("..")) {
    return null;
  }

  const requestedPath = decodedPath === "/" ? "/index.html" : decodedPath;
  const absolutePath = resolve(rootPath, `.${requestedPath}`);

  if (absolutePath !== rootPath && !absolutePath.startsWith(`${rootPath}${sep}`)) {
    return null;
  }

  return absolutePath;
}

function sendText(response, statusCode, message) {
  response.writeHead(statusCode, {
    ...getNoCacheHeaders(),
    "Content-Type": "text/plain; charset=utf-8",
  });
  response.end(message);
}

export function createNoCacheServer({ rootDir = process.cwd() } = {}) {
  return createServer((request, response) => {
    const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? defaultHost}`);
    let filePath = resolveRequestPath(requestUrl.pathname, rootDir);

    if (!filePath) {
      sendText(response, 403, "Forbidden");
      return;
    }

    if (existsSync(filePath) && statSync(filePath).isDirectory()) {
      filePath = resolve(filePath, "index.html");
    }

    if (!existsSync(filePath)) {
      sendText(response, 404, "Not found");
      return;
    }

    response.writeHead(200, {
      ...getNoCacheHeaders(),
      "Content-Type": getContentType(filePath),
    });
    createReadStream(filePath).pipe(response);
  });
}

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  const port = Number(process.argv[2] || process.env.PORT || 4173);
  const server = createNoCacheServer();

  server.listen(port, defaultHost, () => {
    console.log(`Serving ${process.cwd()} at http://${defaultHost}:${port}/index.html`);
  });
}
