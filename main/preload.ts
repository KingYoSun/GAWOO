import { ipcRenderer, contextBridge } from "electron";

contextBridge.exposeInMainWorld("electron", {
  sayMsg: async (message: string) => {
    return await ipcRenderer.invoke("sayMsg", message);
  },
  setup: (channel, callback) =>
    ipcRenderer.on(channel, (event, argv) => callback(event, argv)),
});

contextBridge.exposeInMainWorld("ipfs", {
  imageToIpfs: async (images: Array<string>, pin: Boolean) => {
    return await ipcRenderer.invoke("imageToIpfs", images, pin);
  },
  catImage: async (ipfsPath: string, mimeType: string) => {
    return await ipcRenderer.invoke("catImage", ipfsPath, mimeType);
  },
});
