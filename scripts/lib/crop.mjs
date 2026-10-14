import sharp from "sharp";

// Returns the source rectangle for a cover-crop of (w x h) centred on focus,
// clamped to the image bounds. Matches ImageProcessor mode=crop.
export function cropBox(srcW, srcH, w, h, focus = { x: 0.5, y: 0.5 }) {
  const scale = Math.max(w / srcW, h / srcH);
  const cropW = Math.min(srcW, Math.round(w / scale));
  const cropH = Math.min(srcH, Math.round(h / scale));
  const left = Math.round(Math.min(Math.max(focus.x * srcW - cropW / 2, 0), srcW - cropW));
  const top = Math.round(Math.min(Math.max(focus.y * srcH - cropH / 2, 0), srcH - cropH));
  return { left, top, width: cropW, height: cropH };
}

// Writes a w x h JPEG cover-crop of srcPath to outPath. Upscales when the
// source is smaller than the target, as ImageProcessor does.
export async function cropTo(srcPath, outPath, w, h, focus) {
  const img = sharp(srcPath);
  const { width, height } = await img.metadata();
  await img.extract(cropBox(width, height, w, h, focus))
    .resize(w, h)
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(outPath);
}
