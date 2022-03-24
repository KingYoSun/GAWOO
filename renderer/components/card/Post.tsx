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
import { Box, Typography } from "@mui/material";
import { format } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { SetupContext } from "../../context/SetupContext";
import ImgPreview from "./ImgPreview";
import mime from "mime-types";
import ImagesDialog from "../modal/images";

interface CardPostProps {
  post: Post;
}

const CardPost = ({ post }: CardPostProps) => {
  const [avatar, setAvatar] = useState(null);
  const [width, setWidth] = useState(0);
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const { setup, dispatchSetup } = useContext(SetupContext);
  const parentFlexBox = useRef(null);
  const [dialogIndex, setDialogIndex] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
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
          postIpfs.succeeded.map((name) => {
            const url = `filehandler:///${post.cid}/${name}`;
            const mimeType = mime.lookup(name);
            if (Boolean(mimeType) && mimeType.includes("image/"))
              setImages([...images, url]);
            if (Boolean(mimeType) && mimeType.includes("data:video/"))
              setVideo(url);
          });
        }
      })();
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
    setDialogIndex(index);
    setDialogOpen(true);
  };

  return (
    <FlexRow alignItems="start" flexRef={parentFlexBox}>
      <AvatarIcon src={avatar} marginTop="10px" />
      <Box
        sx={{
          width: width,
        }}
      >
        <FlexRow justifyContent="start">
          <Typography variant="h6">{post.authorName}</Typography>
          <Typography variant="body2">
            ・
            {Boolean(post.publishedAt) &&
              format(
                utcToZonedTime(post.publishedAt, "Asia/Tokyo"),
                "yyyy-MM-dd HH:mm:ss"
              )}
          </Typography>
        </FlexRow>
        <FlexRow justifyContent="start" marginTop="10px">
          <Typography>{post.content}</Typography>
        </FlexRow>
        <FlexRow justifyContent="start" marginLeft="0px">
          {images.map((image, num) => (
            <ImgPreview
              key={num}
              src={image}
              onClick={() => handleOpenImageDialog(num)}
            />
          ))}
        </FlexRow>
      </Box>
      <ImagesDialog
        images={images}
        num={dialogIndex}
        length={images.length}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </FlexRow>
  );
};

export default CardPost;
