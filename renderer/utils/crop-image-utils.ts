import { RefObject } from "react";
import { PixelCrop } from "react-image-crop";
import { makeAspectCrop, centerCrop } from "react-image-crop";

export async function uploadImageToIpfs(dataUrl) {
  const res = await window.ipfs.imageToIpfs(dataUrl, true);
  if (res instanceof Error) {
    console.log("image upload to ipfs failed!: ", res);
    alert(`画像のアップロードに失敗しました: ${res}`);
    return;
  }
  if (!res) return;

  console.log("uploaded image to ipfs is succeeded!");
  return `ipfs://${res}`;
}

export function onSelectFile(
  e: React.ChangeEvent<HTMLInputElement>,
  ctx,
  setState
) {
  if (e.target.files && e.target.files.length > 0) {
    setState({ ...ctx, crop: undefined });
    const reader = new FileReader();
    reader.addEventListener("load", () =>
      setState({
        ...ctx,
        src: reader.result.toString() || "",
        nowEdit: true,
      })
    );
    reader.readAsDataURL(e.target.files[0]);
  }
}

export function onImageLoad(
  e: React.SyntheticEvent<HTMLImageElement>,
  ctx,
  setState,
  imgRef
) {
  imgRef.current = e.currentTarget;
  const { width, height } = e.currentTarget;
  const newCrop = centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      ctx.aspect ?? 1,
      width,
      height
    ),
    width,
    height
  );
  setState({
    ...ctx,
    crop: newCrop,
  });
}

export function cancelCrop(
  initCtx: Object,
  setState: (Object) => void,
  imgRef: RefObject<string>,
  previewCanvasRef: RefObject<string>
) {
  setState({ ...initCtx });
  imgRef = null;
  previewCanvasRef = null;
}

export function cropPreview(
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  crop: PixelCrop
) {
  const ctx = canvas.getContext("2d");

  if (!ctx) return;

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const pixelRatio = window.devicePixelRatio || 1;

  canvas.width = Math.floor(crop.width * pixelRatio * scaleX);
  canvas.height = Math.floor(crop.height * pixelRatio * scaleY);

  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingQuality = "high";

  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;
  const cropWidth = crop.width * scaleX;
  const cropHeight = crop.height * scaleY;

  ctx.drawImage(
    image,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight
  );
}
