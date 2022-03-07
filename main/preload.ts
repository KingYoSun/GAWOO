import { ipcRenderer, IpcRenderer, contextBridge } from "electron";

contextBridge.exposeInMainWorld("electron", {
  sayMsg: async (message: string) => {
    return await ipcRenderer.invoke("sayMsg", message).then((result) => result);
  },
});

contextBridge.exposeInMainWorld("ipfs", {
  imageToIpfs: async (images: Array<string>, pin: Boolean) => {
    return await ipcRenderer
      .invoke("imageToIpfs", images, pin)
      .then((result) => result);
  },
});
