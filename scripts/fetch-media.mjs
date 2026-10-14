// Downloads the original media files from the live site into src/media/,
// keeping the same relative path. Existing files are left alone.
import { mkdir, writeFile, access, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ORIGIN = "https://ste-pam.com";
const FILES = [
  "/media/1052/5.jpg",
  "/media/1054/2.jpg",
  "/media/1055/4.jpg",
  "/media/1056/6.jpg",
  "/media/1058/mountains.jpg",
  "/media/1059/chrome-network-requests.jpg",
  "/media/1060/icon-files.jpg",
  "/media/1061/atomic-design-process.png",
  "/media/1064/itcss-triangle.png",
  "/media/1065/azure-authenticate-button.jpg",
  "/media/1066/azure-expose-api.jpg",
  "/media/1067/azure-functon-ad-settings.jpg",
  "/media/1068/example-scope-silent-token-code.jpg",
];

const exists = (p) => access(p).then(() => true, () => false);

let failed = false;
for (const file of FILES) {
  const dest = path.join("src", file);
  let status = "exists";
  if (!(await exists(dest))) {
    const res = await fetch(ORIGIN + file);
    if (res.status !== 200) {
      console.error(`FAIL ${file}: HTTP ${res.status}`);
      failed = true;
      continue;
    }
    await mkdir(path.dirname(dest), { recursive: true });
    await writeFile(dest, Buffer.from(await res.arrayBuffer()));
    status = "fetched";
  }
  const { size } = await stat(dest);
  const { width, height, format } = await sharp(dest).metadata();
  console.log(`${status.padEnd(7)} ${file}  ${size} bytes  ${width}x${height} ${format}`);
}

if (failed) {
  console.error("One or more media files could not be downloaded.");
  process.exit(1);
}
