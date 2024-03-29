import { useContext, useReducer, useEffect, useState } from "react";
import { IndexIdContext } from "../context/IndexIdContext";
import { Post } from "@prisma/client";
import { FlexRow } from "./Flex";
import { Button, Typography, Divider } from "@mui/material";
import CardTopic from "../components/card/Topic";
import InfiniteScroll from "react-infinite-scroll-component";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { AuthContext } from "../context/AuthContext";
import verifyPost from "../utils/verify-post";

type IndexPostsProps = {
  did?: string;
  reloadCount?: number;
  selfId?: string;
};

type IndexPostsDirection = "new" | "old";

const IndexPosts = ({ did, reloadCount, selfId }: IndexPostsProps) => {
  const { account, dispatchAccount } = useContext(AuthContext);
  const { indexId, dispatchIndexId } = useContext(IndexIdContext);
  const [hasMore, setHasMore] = useState(true);
  const [canLoadNew, setCanLoadNew] = useState(false);
  const [loadablePostsCount, setloadablePostsCount] = useState(0);
  const [upperNextId, setUpperNextId] = useState(null);
  const [lowerNextId, setLowerNextId] = useState(null);
  const [firstLoad, setFirstLoad] = useState(true);
  const [direction, setDirection] = useState<IndexPostsDirection>("old");

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

  useEffect(() => {
    window.electron.callPostCheck(async (payload) => {
      const resCount = await window.electron.countUnreadPosts({
        selfId: Boolean(did) ? null : selfId,
        did: did,
        cursorId: payload.recentPostId,
        direction: "new",
      });
      setloadablePostsCount(resCount.count);
    });
  }, []);

  const getIndexPosts = async () => {
    if (!Boolean(did) && !Boolean(selfId)) return;
    const takePosts = 10;
    let cursorId = direction === "new" ? upperNextId : lowerNextId;
    let { posts, nextId } = await window.electron.indexPosts({
      selfId: Boolean(did) ? null : selfId,
      did: did,
      cursorId: firstLoad ? indexId : cursorId,
      take: takePosts,
      direction: direction,
    });
    if (!posts) {
      setDirection("old");
      return;
    }
    posts = await Promise.all(
      posts.map(async (post) => await verifyPost(post, account))
    );
    if ((posts?.length ?? 0) < takePosts && direction === "old")
      setHasMore(false);
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
    if (posts.length > 0 || (!Boolean(did) && !Boolean(selfId))) return;
    if (Boolean(indexId)) {
      setUpperNextId(indexId);
      setCanLoadNew(true);
    }
    getIndexPosts();
    setFirstLoad(false);
  }, [posts, did, selfId]);

  useEffect(() => {
    if (direction === "new") getIndexPosts();
  }, [direction]);

  const handleReload = () => {
    setUpperNextId(null);
    setLowerNextId(null);
    setDirection("old");
    dispatchIndexId({ type: "reset" });
    dispatchPosts({ type: "reset" });
  };

  useEffect(() => {
    if (reloadCount > 0) handleReload();
  }, [reloadCount]);

  return (
    <>
      <FlexRow marginBottom="0px" marginTop="0px">
        {canLoadNew && (
          <Button
            variant="outlined"
            onClick={() => setDirection("new")}
            sx={{ marginX: "5px" }}
          >
            <MoreVertIcon />
            <Typography variant="subtitle2">新しい投稿を読み込む</Typography>
          </Button>
        )}
        {loadablePostsCount > 0 && (
          <Button
            variant="outlined"
            onClick={() => handleReload()}
            sx={{ marginX: "5px" }}
          >
            <MoreVertIcon />
            <Typography variant="subtitle2">
              最新の投稿{loadablePostsCount}件を読み込む
            </Typography>
          </Button>
        )}
      </FlexRow>
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
                    handleReload();
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

export default IndexPosts;
