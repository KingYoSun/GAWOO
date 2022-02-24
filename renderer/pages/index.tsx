import {useEffect} from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';

const IndexPage = () => {
  useEffect(() => {
    // add a listener to 'message' channel
    global.ipcRenderer.addListener('message', (_event, args) => {
      alert(args);
    });
  }, []);

  /*
  const onSayHiClick = () => {
    global.ipcRenderer.send('message', 'hi from next');
  };
  */

  return (
    <Layout>
      <h1>Hello Next.js 👋</h1>
      <p>
        <Link href="/about">
          <a>About</a>
        </Link>
      </p>
    </Layout>
  );
};

export default IndexPage;
