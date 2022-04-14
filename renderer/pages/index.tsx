import { useContext, useState } from "react";
import { Button, Typography } from "@mui/material";
import { AuthContext } from "../context/AuthContext";
import { FlexRow } from "../components/Flex";
import InputPost from "../components/input/Post";
import { ProfileContext } from "../context/ProfileContext";
import { ErrorDialogContext } from "../context/ErrorDialogContext";
import IndexPosts from "../components/IndexPosts";

const IndexPage = () => {
  const { account, dispatchAccount } = useContext(AuthContext);
  const { profile, dispatchProfile } = useContext(ProfileContext);
  const { errorDialog, dispatchErrorDialog } = useContext(ErrorDialogContext);
  const [reloadCount, setReloadCount] = useState(0);

  const onAccountConnect = async () => {
    const newAccount = await account.authenticate();
    dispatchAccount({ type: "set", payload: newAccount });
  };

  const showAccount = () => {
    console.log("index account: ", account);
  };

  const sendFollow = async () => {
    window.waku.sendMessage({ selfId: account.selfId.id, purpose: "follow" });
  };

  const alertTest = () => {
    console.log("alert test!");
    dispatchErrorDialog({
      type: "open",
      payload: "test!",
    });
    console.log("error dialog!: ", errorDialog);
  };

  const sendShare = async () => {
    window.waku.sendMessage({
      selfId: account.selfId.id,
      purpose: "share",
      post: {
        id: null,
        cid: "test_cid",
        publishedAt: 1111111,
        authorDid: "test did",
        authorName: null,
        authorAvatar: null,
        authorAvatarMime: null,
        content: "test",
        topicCid: null,
        replyToCid: null,
      },
    });
  };

  return (
    <>
      <FlexRow>
        <h1>Hello GAWOO! 👋</h1>
      </FlexRow>
      <FlexRow>
        <Button onClick={alertTest}>Alertテスト</Button>
        <Button onClick={sendFollow}>Followテスト</Button>
        <Button onClick={sendShare}>Shareテスト</Button>
        <Button onClick={showAccount}>アカウント確認</Button>
        <Button onClick={onAccountConnect}>認証</Button>
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
      <IndexPosts reloadCount={reloadCount} />
    </>
  );
};

export default IndexPage;
