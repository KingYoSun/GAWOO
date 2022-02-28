import Web3 from "web3";
import WallectConnectClient from "./wallet-connect-client";

export default class Web3Client {
  web3: Web3;
  wcClient: WallectConnectClient;

  setWalletConnectClient() {
    if (!this.wcClient) this.wcClient = new WallectConnectClient();
  }

  setWeb3(provider) {
    if (!this.web3) this.web3 = new Web3(provider);
  }
}
