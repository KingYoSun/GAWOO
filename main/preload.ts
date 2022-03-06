import { ipcRenderer, IpcRenderer, contextBridge } from "electron";

contextBridge.exposeInMainWorld("electron", {
  sayMsg: async (message: string) => {
    return await ipcRenderer.invoke("sayMsg", message).then((result) => result);
  },
});
