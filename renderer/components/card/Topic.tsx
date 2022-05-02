import { Box, Button, Typography } from "@mui/material";
import { Post } from "@prisma/client";
import { useEffect, useState, useContext } from "react";
import { FlexRow } from "../Flex";
import CardPost from "./Post";
import { SetupContext } from "../../context/SetupContext";
import { extname } from "path";
import ReplyDialog from "../modal/Reply";
import { useRouter } from "next/router";

interface CardTopicProps {
  post: Post;
  doReload: () => Promise<void>;
}

const CardTopic = (props: CardTopicProps) => {
  const [topic, setTopic] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [replyOpen, setReplyOpen] = useState(false);
  const [targetPost, setTargetPost] = useState(null);
  const { setup, dispatchSetup } = useContext(SetupContext);
  const router = useRouter();

  const getPost = async (cid) => {
    const postIpfs = await window.ipfs.getPost(cid);
    if (Boolean(postIpfs.succeeded)) {
      let post = null;
      let jsonName = null;
      postIpfs.succeeded.map((name) => {
        if (extname(name) === ".json") jsonName = name;
      });
      if (Boolean(jsonName)) {
        post = await window.electron.readLocalJson(cid, jsonName); // mainプロセスから取得に書き直し
      }
      return post;
    }
  };

  useEffect(() => {
    if (setup.ipfs && Boolean(props.post.topicCid) && !Boolean(topic)) {
      (async () => {
        const resTopic = await getPost(props.post.topicCid);
        setTopic(resTopic);
      })();
    }
    if (setup.ipfs && Boolean(props.post.replyToCid) && !Boolean(replyTo)) {
      (async () => {
        const resReplyTo = await getPost(props.post.replyToCid);
        setReplyTo(resReplyTo);
      })();
    }
  }, [setup.ipfs]);

  const onReply = (targetPost: Post) => {
    setTargetPost(targetPost);
    setReplyOpen(true);
  };

  const handleClose = () => {
    setReplyOpen(false);
  };

  const handleSubmit = async () => {
    setTargetPost(null);
    setReplyOpen(false);
    await props.doReload();
  };

  return (
    <Box sx={{ position: "relative" }}>
      {Boolean(topic) && (
        <FlexRow justifyContent="start" marginTop="0px" marginBottom="0px">
          <CardPost
            post={topic}
            onReply={() => onReply(topic)}
            showBar={true}
          />
        </FlexRow>
      )}
      {Boolean(replyTo) && props.post.topicCid !== props.post.replyToCid && (
        <Box>
          {Boolean(replyTo.replyToCid) &&
            props.post.topicCid !== replyTo.replyToCid && (
              <FlexRow
                justifyContent="start"
                alignItems="center"
                marginLeft="11.2%"
              >
                <Box
                  sx={{
                    width: "8px",
                    height: "20px",
                    borderLeft: "4px dotted",
                    marginRight: "10px",
                  }}
                />
                <Button
                  variant="text"
                  onClick={() => router.push(`/posts/${topic.cid}`)}
                >
                  <Typography>スレッドを表示...</Typography>
                </Button>
              </FlexRow>
            )}
          <FlexRow justifyContent="start" marginTop="0px" marginBottom="0px">
            <CardPost
              post={replyTo}
              onReply={() => onReply(replyTo)}
              showBar={true}
            />
          </FlexRow>
        </Box>
      )}
      <FlexRow justifyContent="start" marginTop="0px" marginBottom="0px">
        <CardPost
          post={props.post}
          onReply={() => onReply(props.post)}
          showBar={false}
        />
      </FlexRow>
      <ReplyDialog
        replyTo={targetPost}
        topic={topic}
        open={replyOpen}
        handleClose={handleClose}
        handleSubmit={handleSubmit}
      />
    </Box>
  );
};

export default CardTopic;
