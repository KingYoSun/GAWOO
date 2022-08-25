import WallectConnectClient from "./wallet-connect-client";

export default class Web3Client {
  wcClient: WallectConnectClient;

  setWalletConnectClient() {
    if (!this.wcClient) this.wcClient = new WallectConnectClient();
  }
}
