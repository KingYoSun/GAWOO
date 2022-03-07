import { Blob } from "node:buffer";

export const dataUrlToBlob = (dataURI) => {
  const byteString = atob(dataURI.split(",")[1]);
  const mimeType = dataURI.match(/(:)([a-z\/]+)(;)/)[2];
  let buffer = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    buffer[i] = byteString.charCodeAt(i);
  }

  return new Blob([buffer], { type: mimeType });
};
