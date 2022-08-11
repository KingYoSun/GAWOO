import { Notice, Post, User } from "@prisma/client";
import { ipcRenderer, contextBridge } from "electron";
import {
  IIndexNotices,
  IIndexPosts,
  IpfsFile,
  IPostCreate,
  IPostHistory,
  IPostPage,
  TFile,
  WakuClientProps,
  WakuFollowSend,
} from "../renderer/types/general";

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
  indexPosts: async (props: IIndexPosts) => {
    return await ipcRenderer.invoke("indexPosts", props);
  },
  callPostCheck: (callback) => {
    ipcRenderer.on("callPostCheck", (event, payload) => callback(payload));
  },
  countUnreadPosts: async (props: IIndexPosts) => {
    return await ipcRenderer.invoke("countUnreadPosts", props);
  },
  getPostPage: async (props: IPostPage) => {
    return await ipcRenderer.invoke("getPostPage", props);
  },
  getChildPosts: async (props: IPostPage) => {
    return await ipcRenderer.invoke("getChildPosts", props);
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
  countUnreadNotice: async (did: string) => {
    return await ipcRenderer.invoke("countUnreadNotice", did);
  },
  addedNotice: (callback) =>
    ipcRenderer.on("addedNotice", (event, payload) => callback(payload)),
  addNotice: (props: Notice) => {
    ipcRenderer.send("addNotice", props);
  },
  indexNotice: async (props: IIndexNotices) => {
    return await ipcRenderer.invoke("indexNotice", props);
  },
  getLatestNoticeId: async (did: string) => {
    return await ipcRenderer.invoke("getLatestNoticeId", did);
  },
  openUserPage: (callback) =>
    ipcRenderer.on("openUserPage", (event, did) => callback(did)),
  getFollowStatus: async (baseDid: string, did: string) => {
    return await ipcRenderer.invoke("getFollowStatus", baseDid, did);
  },
  createFollow: async (props: WakuFollowSend) => {
    return await ipcRenderer.invoke("createFollow", props);
  },
  deleteFollow: async (props: WakuFollowSend) => {
    return await ipcRenderer.invoke("deleteFollow", props);
  },
});

contextBridge.exposeInMainWorld("ipfs", {
  createPost: async (props: IPostCreate) => {
    return await ipcRenderer.invoke("createPost", props);
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
  sendMessage: async (props: WakuClientProps) => {
    return await ipcRenderer.invoke("sendWakuMessage", props);
  },
  followMessage: (callback) =>
    ipcRenderer.on("followMessage", (event, payload) => callback(payload)),
  shareMessage: (callback) =>
    ipcRenderer.on("shareMessage", (event, payload) => callback(payload)),
  retriveFollowInstanceMessages: async (props: Array<WakuClientProps>) => {
    return await ipcRenderer.invoke("retriveFollowInstanceMessages", props);
  },
  editFollowsFromWaku: async (props: Array<WakuClientProps>) => {
    return await ipcRenderer.invoke("editFollowsFromWaku", props);
  },
  addFollowingShareObservers: async (selfId: string) => {
    return await ipcRenderer.invoke("addFollowingShareWakuObservers", selfId);
  },
  addPostsFromWaku: async (posts: Array<Post>) => {
    return ipcRenderer.invoke("addPostsFromWaku", posts);
  },
  retriveShareInstanceMessages: async (props: IPostHistory) => {
    return await ipcRenderer.invoke("retriveShareInstanceMessages", props);
  },
});
