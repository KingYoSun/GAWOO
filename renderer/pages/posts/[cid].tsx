import { Box, Divider } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import CardPost from "../../components/card/Post";
import { FlexRow } from "../../components/Flex";
import { Post } from "@prisma/client";

type extPost = Post & {
  depth?: number;
};

const PostPage = () => {
  const router = useRouter();
  const { cid } = router.query;
  const [threadPosts, setThreadPosts] = useState([]);

  useEffect(() => {
    if (threadPosts.length === 0) {
      (async () => {
        let res: Array<extPost> = await window.electron.getPostPage(
          cid as string
        );
        setThreadPosts(res.reverse());
      })();
    }
  }, []);

  const checkShowingBar = (post) => {
    return Boolean(threadPosts.find((item) => item.replyToCid === post.cid));
  };

  const calcDepth = (post) => {
    let depth = 0;
    let posPost = post;
    let replyPost = null;
    if (posPost === threadPosts[0]) return depth;

    while (posPost !== threadPosts[0]) {
      depth += 1;
      replyPost = threadPosts.find((item) => item.cid === posPost?.replyToCid);
      posPost = replyPost;
    }
    return depth;
  };

  return (
    <Box sx={{ width: "100%" }}>
      {threadPosts.map((post, index) => (
        <Box key={post.cid} sx={{ width: "100%" }}>
          <FlexRow
            justifyContent="start"
            marginTop="0px"
            marginBottom="0px"
            paddingLeft={`${calcDepth(post) * 20}px`}
          >
            <CardPost
              post={post}
              onReply={() => {}}
              showBar={checkShowingBar(post)}
              isReply={true}
              isThread={true}
            />
          </FlexRow>
        </Box>
      ))}
    </Box>
  );
};

export default PostPage;
