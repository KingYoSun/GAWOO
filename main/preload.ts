import { Post, User } from "@prisma/client";
import { ipcRenderer, contextBridge } from "electron";

contextBridge.exposeInMainWorld("electron", {
  sayMsg: async (message: string) => {
    return await ipcRenderer.invoke("sayMsg", message);
  },
  setup: (callback) =>
    ipcRenderer.on("setup_finished", (event, argv) => callback(event, argv)),
  confirmSetup: async () => {
    return await ipcRenderer.invoke("confirm_setup");
  },
  createUser: async (user: User) => {
    return await ipcRenderer.invoke("createUser", user);
  },
  updateUser: async (user: User) => {
    return await ipcRenderer.invoke("updateUser", user);
  },
  showUser: async (did: string) => {
    return await ipcRenderer.invoke("showUser", did);
  },
  indexPosts: async (did?: string, take?: number) => {
    return await ipcRenderer.invoke("indexPosts", did, take);
  },
});

contextBridge.exposeInMainWorld("ipfs", {
  createPost: async (post: Post, files: Array<any>, pin: boolean) => {
    return await ipcRenderer.invoke("createPost", post, files, pin);
  },
  imageToIpfs: async (image: string, pin: boolean) => {
    return await ipcRenderer.invoke("imageToIpfs", image, pin);
  },
  catImage: async (ipfsPath: string, mimeType: string) => {
    return await ipcRenderer.invoke("catImage", ipfsPath, mimeType);
  },
});
