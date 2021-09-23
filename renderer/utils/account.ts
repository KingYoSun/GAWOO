import Web3 from 'web3'

export default class AccountUtils {
  web3: Web3
  accounts: any
  chainId: any

  constructor () {
  }

  async fetchAccountData (provider) {
    this.web3 = new Web3(provider)
    await this.web3.eth.getChainId()
    .then(res => {
      this.chainId = res
      console.log("Get ChainId: ", res)
    })
    .catch(e => {
      alert('Ethereum ChainIdの取得に失敗しました')
      console.log(e)
    })
    await this.web3.eth.getAccounts()
    .then(res => {
      this.accounts = res
      console.log("Get Accounts: ", res)
    })
    .catch(e => {
      alert('Ethereumアカウント情報の取得に失敗しました')
      console.log(e)
    })
  }
}

