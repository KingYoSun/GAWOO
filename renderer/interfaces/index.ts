import { Post, User } from "@prisma/client";
import { UnixFSEntry } from "ipfs-unixfs-exporter";

declare global {
  interface Window {
    electron: IElectron;
    ipfs: IIpfs;
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

export {};
