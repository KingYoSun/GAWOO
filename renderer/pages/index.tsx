import { useContext, useEffect, useState } from "react";
import { Button, Typography } from "@mui/material";
import { AuthContext } from "../context/AuthContext";
import { FlexRow } from "../components/Flex";
import InputPost from "../components/input/Post";
import { ProfileContext } from "../context/ProfileContext";
import IndexPosts from "../components/IndexPosts";

const IndexPage = () => {
  const { account, dispatchAccount } = useContext(AuthContext);
  const { profile, dispatchProfile } = useContext(ProfileContext);
  const [reloadCount, setReloadCount] = useState(0);

  const showAccount = () => {
    console.log("index account: ", account);
  };

  const noticeTest = async () => {
    console.log("add notice test!");
    await window.electron.addNotice({
      id: null,
      read: false,
      did: account?.selfId?.id,
      type: "test",
      content: "test notice",
      url: null,
      createdAt: String(new Date().getTime()),
    });
    console.log("added notice!");
  };

  const testSignMsg = async () => {
    if (!Boolean(account?.selfId?.id)) {
      console.log("not authenticated!");
      return;
    }

    const msgJWS = await account.selfId.did.createJWS({
      hello: "world",
    });
    console.log("signed!: ", msgJWS);
    const msgJWSVerified = await account.selfId.did.verifyJWS(msgJWS);
    console.log("verify!: ", msgJWSVerified);
  };

  return (
    <>
      <FlexRow>
        <h1>Hello GAWOO! 👋</h1>
      </FlexRow>
      <FlexRow>
        <Button onClick={noticeTest}>通知テスト</Button>
        <Button onClick={showAccount}>アカウント確認</Button>
        <Button onClick={testSignMsg}>createJWS</Button>
      </FlexRow>
      <FlexRow>
        {Boolean(profile?.name) && (
          <InputPost
            doReload={async () => {
              setReloadCount(reloadCount + 1);
            }}
          />
        )}
        {!Boolean(profile?.name) && (
          <Typography
            variant="h6"
            component="span"
            sx={{
              color: (theme) => theme.palette.primary.main,
            }}
          >
            プロフィール設定画面よりユーザー名を設定すると投稿できます
          </Typography>
        )}
      </FlexRow>
      <IndexPosts reloadCount={reloadCount} selfId={account?.selfId?.id} />
    </>
  );
};

export default IndexPage;
