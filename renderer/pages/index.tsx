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
import { IndexIdContext } from "../context/IndexIdContext";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const IndexPage = () => {
  const { account, dispatchAccount } = useContext(AuthContext);
  const { profile, dispatchProfile } = useContext(ProfileContext);
  const { indexId, dispatchIndexId } = useContext(IndexIdContext);
  const { errorDialog, dispatchErrorDialog } = useContext(ErrorDialogContext);
  const [hasMore, setHasMore] = useState(true);
  const [canLoadNew, setCanLoadNew] = useState(false);
  const [upperNextId, setUpperNextId] = useState(null);
  const [lowerNextId, setLowerNextId] = useState(null);
  const [firstLoad, setFirstLoad] = useState(true);
  const [direction, setDirection] = useState<"new" | "old">("old");

  const reducer = (state: Array<Post>, action) => {
    const stateCids = state.map((item) => item.cid);
    switch (action?.type) {
      case "addOld":
        return [
          ...state,
          ...action.payload.filter((item) => !stateCids.includes(item.cid)),
        ];
      case "addNew":
        return [
          ...action.payload.filter((item) => !stateCids.includes(item.cid)),
          ...state,
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

  const getIndexPosts = async () => {
    const takePosts = 10;
    console.log("direction: ", direction);
    let cursorId = direction === "new" ? upperNextId : lowerNextId;
    console.log("cursorId: ", cursorId);
    const { posts, nextId } = await window.electron.indexPosts({
      cursorId: firstLoad ? indexId : cursorId,
      take: takePosts,
      direction: direction,
    });
    if (posts.length < takePosts && direction === "old") setHasMore(false);
    if (direction === "new") {
      if (!Boolean(nextId)) setCanLoadNew(false);
      setUpperNextId(nextId);
      dispatchPosts({ type: "addNew", payload: posts.reverse() });
    }
    if (direction === "old") {
      setLowerNextId(nextId);
      dispatchPosts({ type: "addOld", payload: posts });
    }
    setDirection("old");
  };

  useEffect(() => {
    if (Boolean(indexId)) {
      setUpperNextId(indexId);
      setCanLoadNew(true);
    }
    getIndexPosts();
    setFirstLoad(false);
  }, []);

  useEffect(() => {
    if (direction === "new") getIndexPosts();
  }, [direction]);

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
              dispatchIndexId({ type: "reset" });
              setUpperNextId(null);
              setLowerNextId(null);
              setDirection("old");
              getIndexPosts();
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
      {canLoadNew && (
        <FlexRow marginBottom="0px" marginTop="0px">
          <Button variant="text" onClick={() => setDirection("new")}>
            <MoreVertIcon />
            <Typography variant="subtitle2">新しい投稿を読み込む</Typography>
          </Button>
        </FlexRow>
      )}
      <FlexRow marginTop="20px">
        <div style={{ width: "90%" }}>
          <Divider />
          <InfiniteScroll
            dataLength={posts.length}
            next={() => getIndexPosts()}
            loader={<FlexRow>読み込み中...</FlexRow>}
            endMessage={<FlexRow>読み込み終了</FlexRow>}
            hasMore={hasMore}
            style={{
              overflowX: "hidden",
            }}
            scrollableTarget="mainContent"
            scrollThreshold={0.95}
            inverse={direction === "new"}
          >
            {posts.map((post) => (
              <div key={post.id}>
                <CardTopic
                  post={post}
                  doReload={async () => {
                    dispatchIndexId({ type: "reset" });
                    setUpperNextId(null);
                    setLowerNextId(null);
                    setDirection("old");
                    getIndexPosts();
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
