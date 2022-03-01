import { useEffect, useContext } from "react";
import Link from "next/link";
import Layout from "../components/Layout";
import { Button } from "@mui/material";

import { AuthContext } from "../context/AuthContext";

const IndexPage = () => {
  const { state, dispatch } = useContext(AuthContext);

  const onAccountConnect = async () => {
    const newAccount = await state.authenticate();
    dispatch({
      type: "set",
      payload: newAccount,
    });
  };

  const onDeleteConnection = async () => {
    const newAccount = await state.deleteConnection();
    dispatch({
      type: "set",
      payload: newAccount,
    });
  };

  const showAccount = () => {
    console.log(state);
  };

  useEffect(() => {
    // add a listener to 'message' channel
    global.ipcRenderer.addListener("message", (_event, args) => {
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
      <div>
        <Button onClick={showAccount}>アカウント確認</Button>
        <Button onClick={onAccountConnect}>認証</Button>
        <Button
          onClick={onDeleteConnection}
          disabled={!state.account?.isConnected()}
        >
          切断
        </Button>
      </div>
    </Layout>
  );
};

export default IndexPage;
