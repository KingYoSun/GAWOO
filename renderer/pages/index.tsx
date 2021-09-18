import { useEffect } from 'react'
import Link from 'next/link'
import Layout from '../components/Layout'
import AccountUtils from '../utils/account'

const IndexPage = () => {
  let accountUtils = null
  const onAccountConnect = () => {
    if (!!accountUtils) accountUtils.onConnect()
  }
  useEffect(() => {
    accountUtils = new AccountUtils();
    // add a listener to 'message' channel
    global.ipcRenderer.addListener('message', (_event, args) => {
      alert(args)
    })
  }, [])

  const onSayHiClick = () => {
    global.ipcRenderer.send('message', 'hi from next')
  }

  return (
    <Layout>
      <h1>Hello Next.js 👋</h1>
      <button onClick={onAccountConnect}>Ethereumウォレットと接続</button>
      <p>
        <Link href="/about">
          <a>About</a>
        </Link>
      </p>
    </Layout>
  )
}

export default IndexPage
