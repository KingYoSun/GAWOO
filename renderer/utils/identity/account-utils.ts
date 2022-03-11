import Web3Client from "./web3-client";
import { EthereumAuthProvider, SelfID, WebClient } from "@self.id/web";
import CeramicClient from "./ceramic-client";
import * as ErrorMsg from "../error-msg";
import { BasicProfile } from "../../types/general";
import { DIDProvider } from "dids";
import { Core } from "@self.id/core";
import { CERAMIC_NETWORK } from "../../constants/identity";

export default class AccountUtils {
  web3: Web3Client;
  selfId: SelfID;
  selfIdClient: WebClient;
  selfIdCore: Core;
  address: string;
  ceramicClient: CeramicClient;
  basicProfile: BasicProfile;
  didProvider: DIDProvider;

  constructor() {
    this.selfId = null;
    this.selfIdClient = null;
    this.selfIdCore = null;

    this.ceramicClient = new CeramicClient();
    this.web3 = new Web3Client();
    this.web3.setWalletConnectClient();
  }

  isConnected?() {
    return (
      !!this.web3.wcClient.connector.connected && !!this.web3.wcClient.provider
    );
  }

  async authenticate() {
    if (typeof window === "undefined") {
      console.log("サーバープロセスです");
      return this;
    }

    await this.web3.wcClient.initConnection().catch((e) => ErrorMsg.call(e));
    console.log("set provider!");
    await this.web3.wcClient.setProvider().catch((e) => ErrorMsg.call(e));
    this.web3.setWeb3(this.web3.wcClient.provider);

    this.address = this.web3.wcClient.accounts[0];
    if (!this.address) {
      ErrorMsg.call(new Error("ウォレットが見つかりません"));
      return this;
    }

    const authProvider = new EthereumAuthProvider(
      this.web3.wcClient.provider,
      this.address
    );

    this.selfIdClient = new WebClient({
      ceramic: CERAMIC_NETWORK,
      connectNetwork: CERAMIC_NETWORK,
    });
    await this.selfIdClient.authenticate(authProvider);
    const client = this.selfIdClient;
    this.selfId = new SelfID({ client });
    console.log("authenticated!");

    return this;
  }

  async getMyProfile() {
    if (!(this.selfId instanceof SelfID)) {
      console.log("認証が必要です");
      return;
    }
    console.log("get profile!");

    if (!(this.selfIdCore instanceof Core)) {
      this.selfIdCore = new Core({ ceramic: CERAMIC_NETWORK });
    }

    this.basicProfile = (await this.selfIdCore
      .get("basicProfile", this.selfId.id)
      .catch((e) => ErrorMsg.call(e))) as BasicProfile;

    console.log(`got profile!\n${JSON.stringify(this.basicProfile)}`);

    return this.basicProfile;
  }

  async updateProfile(profile: BasicProfile) {
    if (!(this.selfId instanceof SelfID)) {
      ErrorMsg.call("認証が必要です");
      return;
    }

    console.log("updating Profile!");
    await this.selfId
      .set("basicProfile", profile)
      .catch((e) => ErrorMsg.call(e));

    console.log("updated profile!");
  }

  async deleteConnection() {
    await this.web3.wcClient.deleteConnection().catch((e) => ErrorMsg.call(e));
    console.log("delete connection finished!");
    return this;
  }
}
