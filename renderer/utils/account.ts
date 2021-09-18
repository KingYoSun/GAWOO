import Web3 from 'web3';
import Portis from '@portis/web3';
import Web3Modal from "web3modal";

export default class AccountUtils {
  web3: Web3;
  web3Modal: Web3Modal;
  provider: any;
  accounts: any;
  chainId: any;

  constructor () {
    const providerOptions = {
      portis: {
        package: Portis, // required
        options: {
          id: "5e2561a7-2ffc-498b-9a8d-ec81cbd1284d" // required
        }
      }
    };
    this.web3Modal = new Web3Modal({
      network: "mainnet", // optional
      cacheProvider: true, // optional
      providerOptions // required
    });
  }

  async fetchAccountData () {
    this.web3 = new Web3(this.provider);
    await this.web3.eth.getChainId()
    .then(res => {
      this.chainId = res;
      console.log("Get ChainId: ", res);
    })
    .catch(e => {
      alert('Ethereum ChainIdの取得に失敗しました');
      console.log(e);
    })
    await this.web3.eth.getAccounts()
    .then(res => {
      this.accounts = res;
      console.log("Get Accounts: ", res);
    })
    .catch(e => {
      alert('Ethereumアカウント情報の取得に失敗しました');
      console.log(e);
    })
  }

  async onConnect () {
    try {
      console.log(this.provider)
      this.provider = await this.web3Modal.connect();
    } 
    catch(e) {
      console.log("ウォレットとの接続に失敗しました", e);
      this.web3Modal.clearCachedProvider();
      this.provider = null;
      return;
    }
    this.provider.on("accountsChanged", (accounts) => {
      console.log("Account Changed: ", accounts);
      this.fetchAccountData();
    });
    this.provider.on("chainChanged", (chainId: number) => {
      console.log("chainChanged: ", chainId);
      this.fetchAccountData();
    });
    this.provider.on("connect", (info: { chainId: number }) => {
      console.log("Connected Wallet: ", info);
      this.fetchAccountData();
    });
    this.provider.on("disconnect", (error: { code: number; message: string }) => {
      console.log("Disconnected Wallet: ", error);
    });
  }

  async onDisconnect () {
    await this.web3Modal.clearCachedProvider();
    this.provider = null;
  }
}

