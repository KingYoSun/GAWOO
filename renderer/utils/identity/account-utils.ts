import Web3Client from "./web3-client";
import { ThreeIdConnect, EthereumAuthProvider } from "@3id/connect";
import CeramicClient from "./ceramic-client";
import * as constants from "@ceramicstudio/idx-constants";
import * as ErrorMsg from "../error-msg";
import { BasicProfile } from "../../types/general";
import { IDX } from "@ceramicstudio/idx";
import { DIDProvider } from "dids";

export default class AccountUtils {
  web3: Web3Client;
  threeIdConnect: ThreeIdConnect;
  address: string;
  ceramicClient: CeramicClient;
  basicProfile: BasicProfile;
  idx: IDX;
  didProvider: DIDProvider;

  constructor() {
    this.threeIdConnect = new ThreeIdConnect();
    this.ceramicClient = new CeramicClient();
    this.web3 = new Web3Client();
    this.web3.setWalletConnectClient();
  }

  isConnected?() {
    return !!this.web3.wcClient.connector.connected;
  }

  async authenticate() {
    await this.web3.wcClient.initConnection().catch((e) => ErrorMsg.call(e));
    console.log("set provider!");
    await this.web3.wcClient.setProvider().catch((e) => ErrorMsg.call(e));
    this.web3.setWeb3(this.web3.wcClient.provider);

    this.address = this.web3.wcClient.accounts[0];
    if (!this.address) {
      ErrorMsg.call(new Error("ウォレットが見つかりません"));
      return;
    }

    const authProvider = new EthereumAuthProvider(
      this.web3.wcClient.provider,
      this.address
    );
    await this.threeIdConnect
      .connect(authProvider)
      .catch((e) => ErrorMsg.call(e));
    console.log("3ID connected!");

    this.idx = this.ceramicClient.getIdx();
    const didProvider = this.threeIdConnect.getDidProvider();

    this.idx.ceramic.did.setProvider(didProvider);
    console.log("idx set DIDProvider!");

    await this.idx.ceramic.did.authenticate().catch((e) => ErrorMsg.call(e));
    console.log("authenticated!");
    return this;
  }

  async getBasicProfile() {
    if (!(this.idx instanceof IDX)) {
      console.log("認証が必要です");
      return;
    }
    console.log("get profile!");

    this.basicProfile = await this.idx
      .get(constants.definitions.basicProfile, this.threeIdConnect.accountId)
      .catch((e) => ErrorMsg.call(e));

    console.log(`got profile!\n${JSON.stringify(this.basicProfile)}`);

    return this.basicProfile;
  }

  async updateProfile(profile: BasicProfile) {
    if (!(this.idx instanceof IDX)) {
      ErrorMsg.call(new Error("認証が必要です"));
      return;
    }

    console.log("updating Profile!");

    await this.idx
      .set(constants.definitions.basicProfile, profile)
      .catch((e) => ErrorMsg.call(e));

    console.log("updated profile!");
  }

  async deleteConnection() {
    await this.web3.wcClient.deleteConnection().catch((e) => ErrorMsg.call(e));
    console.log("delete connection finished!");
    return this;
  }
}
