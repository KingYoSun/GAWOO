import { PixelCrop } from "react-image-crop";

export function cropToUrl(canvas: HTMLCanvasElement, crop: PixelCrop) {
  const fileCanvas = document.createElement("canvas");
  const pixelRatio = window.devicePixelRatio || 1;
  const scaleDown = 1 / pixelRatio;

  fileCanvas.width = Math.floor(canvas.width * scaleDown);
  fileCanvas.height = Math.floor(canvas.height * scaleDown);

  const ctx = fileCanvas.getContext("2d");
  if (!ctx) {
    throw new Error("No 2d context");
  }

  ctx.imageSmoothingQuality = "high";
  ctx.scale(scaleDown, scaleDown);
  ctx.drawImage(canvas, 0, 0);

  return fileCanvas.toDataURL("image/png");
}
