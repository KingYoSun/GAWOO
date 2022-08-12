import { Box, Divider, Typography, Button, Collapse } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState, useContext } from "react";
import CardPost from "../../components/card/Post";
import { FlexRow } from "../../components/Flex";
import { Post } from "@prisma/client";
import ReplyDialog from "../../components/modal/reply";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { AuthContext } from "../../context/AuthContext";
import verifyPost from "../../utils/verify-post";

type extPost = Post & {
  depth?: number;
  replyCount?: number;
};

type Thread = {
  post: extPost;
  nextId?: number;
  replyFrom: Array<Thread>;
};

interface IGetPostPage {
  postsArr: Array<extPost>;
  countHasTopic: number;
  nextId: number;
}

const PostPage = () => {
  const router = useRouter();
  const { cid } = router.query;
  const [threadPosts, setThreadPosts] = useState(null);
  const [threadOpen, setThreadOpen] = useState([]);
  const [replyOpen, setReplyOpen] = useState(false);
  const [targetPost, setTargetPost] = useState(null);
  const [showThread, setShowThread] = useState(true);
  const { account, dispatchAccount } = useContext(AuthContext);

  const initPage = async () => {
    let { postsArr, countHasTopic, nextId }: IGetPostPage =
      await window.electron.getPostPage({
        cid: cid as string,
        take: 5,
      });
    postsArr = await Promise.all(
      postsArr.map(async (post) => await verifyPost(post, account))
    );
    const topic = postsArr.find((item) => !item.topicCid && !item.replyToCid);
    topic.replyCount = countHasTopic;
    postsArr = await Promise.all(
      postsArr.map(async (post) => {
        post.depth = calcDepth(post, postsArr, topic);
        post.replyCount = await window.electron.countReply(post.cid);
        return post;
      })
    );
    const maxDepth = Math.max(...postsArr.map((item) => item.depth));
    const postsByDepth = [...Array(maxDepth + 1)].map((_, index) => {
      return postsArr.filter((item) => item.depth === index);
    });
    let threadObj: Thread = {
      post: topic,
      nextId: nextId,
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
            open: false,
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
  };

  useEffect(() => {
    if (!Boolean(threadPosts)) {
      initPage();
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

  const handleClose = () => {
    setReplyOpen(false);
  };

  const handleSubmit = async () => {
    setTargetPost(null);
    setReplyOpen(false);
    initPage();
  };

  const onReply = (targetPost: Post) => {
    setTargetPost(targetPost);
    setReplyOpen(true);
  };

  const handleGetChildren = async (thread: Thread) => {
    if (!Boolean(thread.nextId) && thread.replyFrom.length > 0) {
      thread.nextId = thread.replyFrom[thread.replyFrom.length - 1].post.id + 1;
    }
    const { addPosts, nextId } = await window.electron.getChildPosts({
      cid: thread.post.cid,
      take: 5,
      cursorId: thread.nextId,
    });

    thread.nextId = nextId;

    const addThreads = await Promise.all(
      addPosts.map(async (post: extPost) => {
        post.depth = thread.post.depth + 1;
        post.replyCount = await window.electron.countReply(post.cid);
        threadOpen.push({
          cid: post.cid,
          open: false,
        });
        return {
          post: post,
          nextId: null,
          replyFrom: [],
        };
      })
    );
    thread.replyFrom = [...thread.replyFrom, ...addThreads];
    setThreadPosts(threadPosts);
    setThreadOpen(threadOpen);
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
          onReply={() => onReply(thread.post)}
          showBar={thread.replyFrom.length > 0}
          isReply={thread.post.replyCount < thread.replyFrom.length}
          isThread={true}
          handleClick={async () => {
            if (
              thread.post.replyCount > thread.replyFrom.length &&
              !threadOpen.find((item) => item.cid === thread.post.cid)?.open
            )
              await handleGetChildren(thread);
            const newThreadOpen = threadOpen.map((item) => {
              if (item.cid === thread.post.cid) item.open = !item.open;
              return item;
            });
            setThreadOpen(newThreadOpen);
          }}
        />
        {thread.post.replyCount > thread.replyFrom.length && (
          <FlexRow justifyContent="start" paddingLeft="120px">
            <Button
              variant="text"
              onClick={async () => {
                await handleGetChildren(thread);
                const newThreadOpen = threadOpen.map((item) => {
                  if (item.cid === thread.post.cid) item.open = true;
                  return item;
                });
                setThreadOpen(newThreadOpen);
              }}
            >
              <MoreVertIcon />
              <Typography variant="subtitle2">
                さらに返信を読み込む（
                {thread.replyFrom.length} / {thread.post.replyCount}件）
              </Typography>
            </Button>
          </FlexRow>
        )}
        <Collapse
          in={
            parentOpen &&
            threadOpen.find((item) => item.cid === thread.post.cid)?.open
          }
          sx={{
            width: "100%",
          }}
        >
          {showThread &&
            thread.replyFrom.map((child) => {
              return ThreadElem(
                child,
                parentOpen &&
                  threadOpen.find((item) => item.cid === thread.post.cid)?.open
              );
            })}
        </Collapse>
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
              onReply={() => onReply(threadPosts.post)}
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
      <ReplyDialog
        replyTo={targetPost}
        topic={threadPosts?.post}
        open={replyOpen}
        handleClose={handleClose}
        handleSubmit={handleSubmit}
      />
    </Box>
  );
};

export default PostPage;
