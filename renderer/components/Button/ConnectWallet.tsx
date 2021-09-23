import React from 'react'
import AccountUtils from '../../utils/account'

const ConnectWallet = () => {
  const accountUtils = new AccountUtils()
  const onAccountConnect = () => {
    // if (!!accountUtils) accountUtils.torusLogin()
  }
  const onAccountDisconnect = () => {
    // if (!!accountUtils) accountUtils.torusLogout()
  }

  return (
    <>
      <button onClick={onAccountConnect}>Ethereumウォレットと接続</button>
      <button onClick={onAccountDisconnect}>Ethereumウォレットと切断</button>
    </>
  )
}

export default ConnectWallet