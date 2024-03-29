import Web3Client from "./web3-client";
import { EthereumAuthProvider, SelfID, WebClient } from "@self.id/web";
import Ceramic from "./ceramic-client";
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
  ceramicClient: Ceramic;
  basicProfile: BasicProfile;
  didProvider: DIDProvider;
  authenticated: boolean;

  constructor() {
    this.selfId = null;
    this.selfIdClient = null;
    this.selfIdCore = null;

    this.ceramicClient = new Ceramic();
    this.web3 = new Web3Client();
    this.web3.setWalletConnectClient();
  }

  isConnected?() {
    return (
      !!this.web3.wcClient.connector.connected && !!this.web3.wcClient.provider
    );
  }

  async authenticate(newSession: boolean = false) {
    if (typeof window === "undefined") {
      console.log("サーバープロセスです");
      return this;
    }

    await this.web3.wcClient.initConnection(newSession).catch((e) => {
      throw e;
    });
    console.log("set provider!");
    await this.web3.wcClient.setProvider().catch((e) => {
      throw e;
    });

    this.address = this.web3.wcClient.accounts[0];
    if (!this.address) {
      throw new Error("ウォレットが見つかりません");
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
    this.authenticated = true;

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
      .catch((e) => {
        throw e;
      })) as BasicProfile;

    console.log(`got profile!\n${JSON.stringify(this.basicProfile)}`);

    return this.basicProfile;
  }

  async updateProfile(profile: BasicProfile) {
    if (!(this.selfId instanceof SelfID)) {
      throw "認証が必要です";
      return;
    }

    console.log("updating Profile!");
    await this.selfId.set("basicProfile", profile).catch((e) => {
      throw e;
    });

    console.log("updated profile!");
  }

  async sign(obj) {
    if (!Boolean(this.selfId?.id)) {
      console.log("not authenticated!");
      return;
    }

    return await this.selfId.did.createJWS(obj);
  }
}
