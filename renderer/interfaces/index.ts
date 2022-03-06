declare global {
  interface Window {
    electron: IElectron;
  }
}

interface IElectron {
  sayMsg: (message: string) => void;
}

export {};
