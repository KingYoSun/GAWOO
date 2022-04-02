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
  const [threadPosts, setThreadPosts] = useState(null);
  const [threadOpen, setThreadOpen] = useState([]);

  useEffect(() => {
    if (!Boolean(threadPosts)) {
      (async () => {
        let res: Array<extPost> = await window.electron.getPostPage(
          cid as string
        );
        const topic = res.find((item) => !item.topicCid && !item.replyToCid);
        res = res.map((post) => {
          post.depth = calcDepth(post, res, topic);
          return post;
        });
        const maxDepth = Math.max(...res.map((item) => item.depth));
        const postsByDepth = [...Array(maxDepth + 1)].map((_, index) => {
          return res.filter((item) => item.depth === index);
        });
        let threadObj = {
          post: topic,
          replyFrom: [],
        };
        let targetThreads;
        let newThreadOpen = [
          {
            cid: topic.cid,
            open: true,
          },
        ];
        postsByDepth.map((arr, index) => {
          if (index === 0) {
            targetThreads = [threadObj];
            return;
          }
          if (index > 0) {
            arr.map((item) => {
              const threadIndex = targetThreads.findIndex(
                (tItem) => tItem.post.cid === item.replyToCid
              );
              if (threadIndex !== -1)
                targetThreads[threadIndex].replyFrom.push({
                  post: item,
                  replyFrom: [],
                });
              newThreadOpen.push({
                cid: item.cid,
                open: true,
              });
            });
            let newTargetThreads = [];
            targetThreads.map((thread) => {
              newTargetThreads = [...newTargetThreads, ...thread.replyFrom];
            });
            targetThreads = newTargetThreads;
          }
        });
        setThreadPosts(threadObj);
        setThreadOpen(newThreadOpen);
      })();
    }
  }, []);

  const calcDepth = (post: Post, arr: Array<Post>, topic: Post) => {
    let depth = 0;
    let posPost = post;
    let replyPost = null;
    if (posPost === topic) return depth;

    while (posPost !== topic) {
      depth += 1;
      replyPost = arr.find((item) => item.cid === posPost?.replyToCid);
      posPost = replyPost;
    }
    return depth;
  };

  const PostElem = (thread, parentOpen) => {
    return (
      <FlexRow
        key={thread.post.cid}
        justifyContent="start"
        marginTop="0px"
        marginBottom="0px"
        paddingLeft="10px"
      >
        <CardPost
          post={thread.post}
          onReply={() => {}}
          showBar={thread.replyFrom.length > 0}
          isReply={thread.replyFrom.length === 0}
          isThread={true}
          parentOpen={parentOpen}
          handleClick={() => {
            const newThreadOpen = threadOpen.map((item) => {
              if (item.cid === thread.post.cid) item.open = !item.open;
              return item;
            });
            console.log(newThreadOpen);
            setThreadOpen(newThreadOpen);
          }}
        />
        {thread.replyFrom.map((child) => {
          return ThreadElem(
            child,
            parentOpen &&
              threadOpen.find((item) => item.cid === thread.post.cid)?.open
          );
        })}
      </FlexRow>
    );
  };

  const ThreadElem = (thread, open) => {
    return PostElem(thread, open);
  };

  return (
    <Box sx={{ width: "100%" }}>
      {Boolean(threadPosts) && (
        <Box sx={{ width: "100%" }}>
          <FlexRow
            justifyContent="start"
            marginTop="0px"
            marginBottom="0px"
            paddingLeft="0px"
          >
            <CardPost
              post={threadPosts.post}
              onReply={() => {}}
              showBar={threadPosts.replyFrom.length > 0}
              isReply={true}
              isThread={true}
            />
          </FlexRow>
          {threadPosts.replyFrom.map((thread) => {
            return ThreadElem(
              thread,
              threadOpen.find((item) => item.cid === threadPosts.post.cid)?.open
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default PostPage;
