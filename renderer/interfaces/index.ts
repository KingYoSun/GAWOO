import { Post, User } from "@prisma/client";
import { WakuClientProps } from "../types/general";

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
}

interface IIpfs {
  createPost: (
    post: Post,
    files: Array<any>,
    pin: boolean
  ) => { post: Post; failures: Array<string> };
  imageToIpfs: (image: string, pin: boolean) => string | Error;
  catImage: (ipfsPath: string, mimeType: string) => string;
}

interface IWaku {
  setup: (callback: (flag: boolean) => void) => void;
  isConnected: () => boolean;
  addObservers: (props: Array<WakuClientProps>) => string;
  deleteObservers: (props: Array<WakuClientProps>) => string;
  sendMessage: (prop: WakuClientProps) => string;
  followMessage: (callback: (msg: string) => void) => void;
  sharePost: (callback: (msg: string) => void) => void;
}

export {};
