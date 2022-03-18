import { useContext, useReducer, useEffect } from "react";
import { Button, Box, Divider } from "@mui/material";
import { AuthContext } from "../context/AuthContext";
import { FlexRow } from "../components/Flex";
import InputPost from "../components/Input/Post";
import CardPost from "../components/card/Post";
import { Post } from "@prisma/client";

const IndexPage = () => {
  const { account, dispatchAccount } = useContext(AuthContext);

  const reducer = (state: Array<Post>, action) => {
    switch (action?.type) {
      case "add":
        const addPostCids = action.payload.map((item) => item.cid);
        return [
          ...state.filter((item) => !addPostCids.includes(item.cid)),
          ...action.payload,
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

  const onSayHiClick = async () => {
    const result = await window.electron.sayMsg("test");
    console.log(result);
  };

  const sendFollow = async () => {
    window.waku.sendMessage({ selfId: account.selfId.id, purpose: "follow" });
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
        content: "test",
      },
    });
  };

  const getIndexPosts = async () => {
    const newPosts = await window.electron.indexPosts();
    dispatchPosts({ type: "add", payload: newPosts });
  };

  useEffect(() => {
    getIndexPosts();
  }, []);

  return (
    <>
      <FlexRow>
        <h1>Hello GAWOO! 👋</h1>
      </FlexRow>
      <FlexRow>
        <Button onClick={onSayHiClick}>ipcRendererテスト</Button>
        <Button onClick={sendFollow}>Followテスト</Button>
        <Button onClick={sendShare}>Shareテスト</Button>
        <Button onClick={showAccount}>アカウント確認</Button>
        <Button onClick={onAccountConnect}>認証</Button>
      </FlexRow>
      <FlexRow>
        <InputPost doReload={() => getIndexPosts()} />
      </FlexRow>
      <FlexRow marginTop="20px">
        <Box width="90%">
          <Divider />
          {posts.map((post) => (
            <Box key={post.id}>
              <CardPost post={post} />
              <Divider />
            </Box>
          ))}
        </Box>
      </FlexRow>
    </>
  );
};

export default IndexPage;
