import { useContext, useCallback, useReducer, useEffect } from "react";
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

  const onDeleteConnection = async () => {
    const newAccount = await account.deleteConnection();
    dispatchAccount({ type: "set", payload: newAccount });
  };

  const showAccount = () => {
    console.log("index account: ", account);
  };

  const onSayHiClick = async () => {
    const result = await window.electron.sayMsg("test");
    console.log(result);
  };

  const logoutBtnDisabled = useCallback(() => {
    return !account?.isConnected();
  }, [account]);

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
        <Button onClick={showAccount}>アカウント確認</Button>
        <Button onClick={onAccountConnect}>認証</Button>
        <Button onClick={onDeleteConnection} disabled={logoutBtnDisabled()}>
          切断
        </Button>
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
