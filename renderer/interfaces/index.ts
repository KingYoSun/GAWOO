import { UnixFSEntry } from "ipfs-unixfs-exporter";

declare global {
  interface Window {
    electron: IElectron;
    ipfs: IIpfs;
  }
}

interface IElectron {
  sayMsg: (message: string) => void;
  setup: (channel: string, callback: () => void) => void;
}

interface IIpfs {
  imageToIpfs: (
    images: Array<string>,
    pin: Boolean
  ) => {
    successes: Array<UnixFSEntry>;
    failures: Array<string>;
  };
  catImage: (ipfsPath: string, mimeType: string) => string;
}

export {};
