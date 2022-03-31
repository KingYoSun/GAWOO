import { Post, User } from "@prisma/client";
import { IpfsFile, IpfsPost, TFile, WakuClientProps } from "../types/general";

declare global {
  interface Window {
    electron: IElectron;
    ipfs: IIpfs;
    waku: IWaku;
  }
}

interface IElectron {
  sayMsg: (message: string) => void;
  setup: (callback: () => void) => void;
  confirmSetup: () => boolean;
  createUser: (user: User) => User | string;
  updateUser: (user: User) => User | string;
  showUser: (did: string) => User | string | null;
  indexPosts: (did?: string, take?: number) => Array<Post>;
  getFileByBase64: (ipfsFile: IpfsFile) => string;
  getFullPath: (type: string) => Array<string>;
  readLocalJson: (cid: string, name: string) => Post;
  countReply: (cid: string) => number;
}

interface IIpfs {
  createPost: (
    post: Post,
    files: Array<TFile>,
    pin: boolean
  ) => { post: Post; failures: Array<string> };
  imageToIpfs: (image: string, pin: boolean) => string | Error;
  catImage: (ipfsPath: string, mimeType: string) => string;
  getPost: (cat: string) => IpfsPost;
}

interface IWaku {
  init: () => boolean;
  isConnected: () => boolean;
  addObservers: (props: Array<WakuClientProps>) => string;
  deleteObservers: (props: Array<WakuClientProps>) => string;
  sendMessage: (prop: WakuClientProps) => string;
  followMessage: (callback: (msg: string) => void) => void;
  sharePost: (callback: (msg: string) => void) => void;
}

export {};
