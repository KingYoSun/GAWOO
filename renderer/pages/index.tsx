import { useContext } from "react";
import { Button } from "@mui/material";
import { AuthContext } from "../context/AuthContext";
import { FlexRow } from "../components/Flex";

const IndexPage = () => {
  const { account, dispatchAccount } = useContext(AuthContext);

  const onAccountConnect = async () => {
    const newAccount = await account.authenticate();
    dispatchAccount({
      type: "set",
      payload: newAccount,
    });
  };

  const onDeleteConnection = async () => {
    const newAccount = await account.deleteConnection();
    dispatchAccount({
      type: "set",
      payload: newAccount,
    });
  };

  const showAccount = () => {
    console.log("index account: ", account);
  };

  const onSayHiClick = async () => {
    const result = await window.electron.sayMsg("test");
    console.log(result);
  };

  return (
    <>
      <FlexRow>
        <h1>Hello GAWOO! 👋</h1>
      </FlexRow>
      <FlexRow>
        <Button onClick={onSayHiClick}>ipcRendererテスト</Button>
        <Button onClick={showAccount}>アカウント確認</Button>
        <Button onClick={onAccountConnect}>認証</Button>
        <Button onClick={onDeleteConnection} disabled={!account?.isConnected()}>
          切断
        </Button>
      </FlexRow>
    </>
  );
};

export default IndexPage;
