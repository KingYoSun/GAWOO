import { useContext, useReducer, useEffect, useState, useRef } from "react";
import { Button, Box, Divider, Typography } from "@mui/material";
import { AuthContext } from "../context/AuthContext";
import { FlexRow } from "../components/Flex";
import InputPost from "../components/input/Post";
import { Post } from "@prisma/client";
import { ProfileContext } from "../context/ProfileContext";
import CardTopic from "../components/card/Topic";
import InfiniteScroll from "react-infinite-scroll-component";
import { ErrorDialogContext } from "../context/ErrorDialogContext";

const IndexPage = () => {
  const { account, dispatchAccount } = useContext(AuthContext);
  const { profile, dispatchProfile } = useContext(ProfileContext);
  const { errorDialog, dispatchErrorDialog } = useContext(ErrorDialogContext);
  const [cursorId, setCursorId] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const reducer = (state: Array<Post>, action) => {
    switch (action?.type) {
      case "add":
        const stateCids = state.map((item) => item.cid);
        return [
          ...state,
          ...action.payload.filter((item) => !stateCids.includes(item.cid)),
        ];
      case "remove":
        return [...state.filter((msg) => msg !== action.payload)];
      case "reset":
        return [];
      default:
        return state;
    }
  };
  const [posts, dispatchPosts] = useReducer(reducer, []);

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

  const getIndexPosts = async (direction: "new" | "old") => {
    const takePosts = 15;
    const newPosts = await window.electron.indexPosts({
      cursorId: cursorId,
      take: takePosts,
    });
    if (newPosts.length < takePosts) setHasMore(false);
    const cursorPost =
      direction === "new" ? newPosts[0] : newPosts[newPosts.length - 1];
    setCursorId(cursorPost.id);
    dispatchPosts({ type: "add", payload: newPosts });
  };

  useEffect(() => {
    getIndexPosts("old");
  }, []);

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
              setCursorId(null);
              getIndexPosts("old");
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
      <FlexRow marginTop="20px">
        <div style={{ width: "90%" }}>
          <Divider />
          <InfiniteScroll
            dataLength={posts.length}
            next={() => getIndexPosts("old")}
            loader={<FlexRow>読み込み中...</FlexRow>}
            endMessage={<FlexRow>読み込み終了</FlexRow>}
            hasMore={hasMore}
            style={{
              overflowX: "hidden",
            }}
            scrollableTarget="mainContent"
            scrollThreshold={0.95}
          >
            {posts.map((post) => (
              <div key={post.id}>
                <CardTopic
                  post={post}
                  doReload={async () => {
                    setCursorId(null);
                    getIndexPosts("old");
                  }}
                />
                <Divider />
              </div>
            ))}
          </InfiniteScroll>
        </div>
      </FlexRow>
    </>
  );
};

export default IndexPage;
