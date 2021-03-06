import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@kingyosun/legacy-modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { INFURA_ID, WALLET_CONNECT_BRIDGE_URL } from "../../constants/identity";

export default class WallectConnectClient {
  connector: WalletConnect;
  provider: WalletConnectProvider;
  accounts: Array<string>;
  chainId: number;

  constructor() {
    this.initConnector();
  }

  initConnector() {
    this.connector = new WalletConnect({
      bridge: WALLET_CONNECT_BRIDGE_URL,
      qrcodeModal: QRCodeModal,
    });
  }

  async initConnection(newSession: boolean) {
    this.initConnector();
    if (newSession) {
      await this.connector.killSession();
      console.log("session killed!");
    }

    if (this.connector.connected) {
      return new Promise((resolve) => {
        this.accounts = this.connector.accounts;
        this.chainId = this.connector.chainId;
        resolve(true);
      });
    }

    if (!this.connector.connected) {
      console.log("start new walletconnect session!");
      await this.connector.createSession();

      console.log(`init connection!`);
      return new Promise((resolve, reject) => {
        this.connector.on("connect", async (e, payload) => {
          if (e) reject(e);
          const { accounts, chainId } = payload.params[0];
          this.accounts = accounts;
          this.chainId = chainId;
          console.log(`connect walletconnect!`);
          console.log(`accounts: ${this.accounts}, chainId: ${this.chainId}`);
          resolve(true);
        });
      });
    }
  }

  async setProvider() {
    this.provider = new WalletConnectProvider({
      infuraId: INFURA_ID,
    });

    console.log("enable walletconnect provider!");
    return new Promise((resolve, reject) => {
      this.provider
        .enable()
        .then(() => {
          console.log("second call resolved!");
          resolve(true);
        })
        .catch(() => {
          reject(new Error("web3プロバイダーの設定に失敗しました"));
        });
    });
  }
}
