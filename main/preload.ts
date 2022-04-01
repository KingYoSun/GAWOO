import { Post, User } from "@prisma/client";
import { ipcRenderer, contextBridge } from "electron";
import { IpfsFile, TFile, WakuClientProps } from "../renderer/types/general";

contextBridge.exposeInMainWorld("electron", {
  sayMsg: async (message: string) => {
    return await ipcRenderer.invoke("sayMsg", message);
  },
  setup: (callback) =>
    ipcRenderer.on("setupFinished", (event, argv) => callback(event, argv)),
  confirmSetup: async () => {
    return await ipcRenderer.invoke("confirmSetup");
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
  getPostPage: async (cid: string) => {
    return await ipcRenderer.invoke("getPostPage", cid);
  },
  getFileByBase64: async (ipfsFile: IpfsFile) => {
    return await ipcRenderer.invoke("getFileByBase64", ipfsFile);
  },
  getFullPath: async (type: string) => {
    return await ipcRenderer.invoke("getFullPath", type);
  },
  readLocalJson: async (cid: string, name: string) => {
    return await ipcRenderer.invoke("readLocalJson", cid, name);
  },
  countReply: async (cid: string) => {
    return await ipcRenderer.invoke("countReply", cid);
  },
});

contextBridge.exposeInMainWorld("ipfs", {
  createPost: async (post: Post, files: Array<TFile>, pin: boolean) => {
    return await ipcRenderer.invoke("createPost", post, files, pin);
  },
  imageToIpfs: async (image: string, pin: boolean) => {
    return await ipcRenderer.invoke("imageToIpfs", image, pin);
  },
  catImage: async (ipfsPath: string, mimeType: string) => {
    return await ipcRenderer.invoke("catImage", ipfsPath, mimeType);
  },
  getPost: async (cid: string) => {
    return await ipcRenderer.invoke("getPost", cid);
  },
});

contextBridge.exposeInMainWorld("waku", {
  init: async () => {
    return await ipcRenderer.invoke("initWaku");
  },
  isConnected: () => {
    return ipcRenderer.invoke("WakuIsConnected");
  },
  addObservers: async (props: Array<WakuClientProps>) => {
    return await ipcRenderer.invoke("addWakuObservers", props);
  },
  deleteObservers: async (props: Array<WakuClientProps>) => {
    return await ipcRenderer.invoke("deleteWakuObservers", props);
  },
  sendMessage: async (prop: WakuClientProps) => {
    return await ipcRenderer.invoke("sendWakuMessage", prop);
  },
  followMessage: (callback) =>
    ipcRenderer.on("followMessage", (event, argv) => callback(event, argv)),
  sharePost: (callback) =>
    ipcRenderer.on("sharePost", (event, argv) => callback(event, argv)),
});
