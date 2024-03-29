import { Post } from "@prisma/client";
import {
  useContext,
  useEffect,
  useState,
  useLayoutEffect,
  useRef,
} from "react";
import { AvatarIcon } from "../AvatarIcon";
import { FlexRow } from "../Flex";
import { Box, Typography, Card, IconButton } from "@mui/material";
import { format } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { SetupContext } from "../../context/SetupContext";
import ImgPreview from "./ImgPreview";
import mime from "mime-types";
import ImagesDialog from "../modal/Images";
import ChatIcon from "@mui/icons-material/Chat";
import { useRouter } from "next/router";
import { IndexIdContext } from "../../context/IndexIdContext";

type PostAndReply = Post & {
  replyCount?: number;
};

interface CardPostProps {
  post: PostAndReply;
  onReply: () => void;
  showBar?: Boolean;
  isReply?: Boolean;
  isThread?: Boolean;
  handleClick?: () => void;
}

const CardPost = ({
  post,
  onReply,
  showBar,
  isReply,
  isThread,
  handleClick,
}: CardPostProps) => {
  const [avatar, setAvatar] = useState(null);
  const [width, setWidth] = useState(0);
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const { setup, dispatchSetup } = useContext(SetupContext);
  const parentFlexBox = useRef(null);
  const [dialogIndex, setDialogIndex] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const refImageDialog = useRef(null);
  const [elemHeight, setElemHeight] = useState(0);
  const router = useRouter();
  const { indexId, dispatchIndexId } = useContext(IndexIdContext);

  useEffect(() => {
    getElemHeight();
    if (setup.ipfs && Boolean(post.authorAvatar)) {
      (async () => {
        const newAvatar = await window.ipfs.catImage(
          post.authorAvatar,
          post.authorAvatarMime ?? "image/png"
        );
        setAvatar(newAvatar);
      })();
      (async () => {
        const postIpfs = await window.ipfs.getPost(post.cid);
        if (Boolean(postIpfs.succeeded)) {
          const addImages = [];
          let addVideo = null;
          postIpfs.succeeded.map((name) => {
            const url = `filehandler:///${post.cid}/${name}`;
            const mimeType = mime.lookup(name);
            if (Boolean(mimeType) && mimeType.includes("image/"))
              addImages.push(url);
            if (Boolean(mimeType) && mimeType.includes("video/")) {
              addVideo = url;
            }
          });
          setImages([...images, ...addImages]);
          setVideo(addVideo);
          getElemHeight();
        }
      })();
      if (!Boolean(post.replyCount)) {
        (async () => {
          post.replyCount = await window.electron.countReply(post.cid);
        })();
      }
    }
  }, [setup.ipfs]);

  useLayoutEffect(() => {
    const updateSize = () => {
      setWidth(parentFlexBox?.current?.clientWidth * 0.75);
    };
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const handleOpenImageDialog = (index: number) => {
    refImageDialog.current?.setIndexFromParent(index);
    setDialogOpen(true);
  };

  const getElemHeight = () => {
    const height = parentFlexBox.current?.clientHeight ?? 0;
    setElemHeight(height);
  };

  return (
    <Card
      sx={{
        borderRadius: "0px",
        boxShadow: "none",
        width: "100%",
        height: `${elemHeight + 50}px`,
        position: "relative",
        backgroundColor: "rgba(0, 0, 0, 0)",
      }}
    >
      <FlexRow
        alignItems="start"
        flexRef={parentFlexBox}
        marginTop="0px"
        marginBottom="0px"
      >
        <Box sx={{ position: "relative" }}>
          <AvatarIcon src={avatar} marginTop="10px" did={post.authorDid} />
          {Boolean(showBar) && (
            <Box
              sx={{
                position: "absolute",
                top: "65px",
                left: "21px",
                width: "2px",
                height: `${elemHeight}px`,
                backgroundColor: (theme) => theme.palette.divider,
              }}
            />
          )}
        </Box>
        <Box
          sx={{
            width: width,
          }}
        >
          <FlexRow justifyContent="start">
            <Typography
              variant="h6"
              onClick={() => router.push(`/users/${post.authorDid}`)}
              sx={{
                zIndex: 3,
                "&:hover": {
                  cursor: "pointer",
                },
              }}
            >
              {post.authorName}
            </Typography>
            <Typography variant="body2">
              ・
              {Boolean(post.publishedAt) &&
                format(
                  utcToZonedTime(Number(post.publishedAt), "Asia/Tokyo"),
                  "yyyy-MM-dd HH:mm:ss"
                )}
            </Typography>
            <Typography
              variant="body2"
              color={post.jws === "verified" ? "green" : "error"}
              sx={{
                marginLeft: "5px",
              }}
            >
              {post.jws === "verified" ? "認証済み" : "認証無し"}
            </Typography>
          </FlexRow>
          <FlexRow justifyContent="start" marginTop="10px">
            <Typography>{post.content}</Typography>
          </FlexRow>
          <FlexRow justifyContent="start" marginLeft="0px">
            {images.map((image, num) => (
              <Box key={num} sx={{ zIndex: 3 }}>
                <ImgPreview
                  src={image}
                  onClick={() => handleOpenImageDialog(num)}
                  onLoad={() => getElemHeight()}
                />
              </Box>
            ))}
          </FlexRow>
          {Boolean(video) && (
            <video
              src={video}
              controls
              onLoadedMetadata={() => getElemHeight()}
              style={{
                borderRadius: "10px",
                maxWidth: "500px",
                maxHeight: "500px",
                zIndex: 3,
              }}
            />
          )}
        </Box>
        <ImagesDialog
          images={images}
          length={images.length}
          open={dialogOpen}
          ref={refImageDialog}
          onClose={() => setDialogOpen(false)}
        />
      </FlexRow>
      <FlexRow justifyContent="start" marginLeft="15%">
        {(!isReply || isThread) && (
          <IconButton
            onClick={() => onReply()}
            color="primary"
            sx={{ zIndex: 3 }}
          >
            <ChatIcon />
            <Typography>{post.replyCount ?? ""}</Typography>
          </IconButton>
        )}
      </FlexRow>
      {!isReply && (
        <Box
          onClick={() => {
            if (!Boolean(handleClick)) {
              dispatchIndexId({ type: "set", payload: post.id });
              router.push(`/posts/${post.cid}`);
            }
            if (Boolean(handleClick)) handleClick();
          }}
          sx={{
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0)",
            zIndex: 2,
            transition: (theme) =>
              theme.transitions.create("background-color", {
                duration: theme.transitions.duration.enteringScreen,
              }),
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.05)",
              cursor: "pointer",
            },
          }}
        />
      )}
    </Card>
  );
};

export default CardPost;
