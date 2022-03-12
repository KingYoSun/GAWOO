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
}

interface IIpfs {
  addToIpfs: (
    files: Array<any>,
    pin: boolean
  ) => { cid: string; failures: Array<string> };
  imageToIpfs: (image: string, pin: boolean) => string | Error;
  catImage: (ipfsPath: string, mimeType: string) => string;
}

export {};
