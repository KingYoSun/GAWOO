import { Post } from "@prisma/client";
import {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ProfileContext } from "../../context/ProfileContext";
import { TextField, Button, IconButton } from "@mui/material";
import { FlexRow } from "../Flex";
import { AvatarIcon } from "../AvatarIcon";
import { AuthContext } from "../../context/AuthContext";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { ErrorDialogContext } from "../../context/ErrorDialogContext";
import ImgPreview from "./ImgPreview";
import ImageIcon from "@mui/icons-material/Image";
import LocalMoviesIcon from "@mui/icons-material/LocalMovies";
import { basename, extname } from "path";
import mime from "mime-types";
import VideoPreview from "./VideoPreview";
import { el } from "date-fns/locale";

type InputPostProps = {
  topic?: Post;
  replyTo?: Post;
  doReload?: () => Promise<void>;
};

const emptyPost = {
  cid: null,
  content: "",
  publishedAt: null,
  authorDid: null,
};

const InputPost = (props: InputPostProps) => {
  const { account, dispatchAccount } = useContext(AuthContext);
  const { profile, dispatchProfile } = useContext(ProfileContext);
  const { errorDialog, dispatchErrorDialog } = useContext(ErrorDialogContext);
  const [contentLength, setContentLength] = useState(0);
  const [width, setWidth] = useState(0);
  const [upload, setUpload] = useState(false);
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [counter, setCounter] = useState(0);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Post>({
    defaultValues: emptyPost as Post,
    mode: "onSubmit",
  });

  const parentFlexBox = useRef(null);

  useEffect(() => {
    if (Boolean(account?.selfId?.id)) setValue("authorDid", account.selfId.id);
  }, [account?.selfId?.id]);

  useEffect(() => {
    if (Boolean(profile?.image?.original.src)) {
      setValue("authorAvatar", profile?.image?.original.src);
      setValue("authorAvatarMime", profile?.image?.original.mimeType);
    }
    if (Boolean(profile?.name)) setValue("authorName", profile.name);
  }, [profile?.name, profile?.image?.original.src]);

  useLayoutEffect(() => {
    const updateSize = () => {
      setWidth(parentFlexBox?.current?.clientWidth * 0.75);
    };
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const handleImageButton = async () => {
    let files: Array<string> = await window.electron.getFullPath("image");
    if (!Boolean(files)) return;
    if (images.length + files.length > 4) {
      dispatchErrorDialog({
        type: "open",
        payload: "一度に投稿できる画像は4枚までです",
      });
      return;
    }
    if (Boolean(video)) {
      dispatchErrorDialog({
        type: "open",
        payload: "画像と動画を同時に投稿することはできません",
      });
      return;
    }
    const imgNames = images.map((image) => image.name);
    files = files.filter((file) => !imgNames.includes(basename(file)));
    if (files.length > 0) setImages([...images, ...files]);
  };

  const handleVideoButton = async () => {
    let files: Array<string> = await window.electron.getFullPath("video");
    if (!Boolean(files)) return;
    if (images.length > 0) {
      dispatchErrorDialog({
        type: "open",
        payload: "画像と動画を同時に投稿することはできません",
      });
      return;
    }
    if (files.length > 0) setVideo(files[0]);
  };

  const onDrop = (e) => {
    const file = e.dataTransfer.files[0];
    if (file.type.includes("image")) {
      if (images.length >= 4) {
        dispatchErrorDialog({
          type: "open",
          payload: "一度に投稿できる画像は4枚までです",
        });
        return;
      }
      if (Boolean(video)) {
        dispatchErrorDialog({
          type: "open",
          payload: "画像と動画を同時に投稿することはできません",
        });
        return;
      }

      const imgNames = images.map((image) => image.name);
      if (!imgNames.includes(file.name)) setImages([...images, file]);
    }
    if (file.type.includes("video") && video?.name !== file.name) {
      if (images.length > 0) {
        dispatchErrorDialog({
          type: "open",
          payload: "画像と動画を同時に投稿することはできません",
        });
        return;
      }

      setVideo(file);
    }
    setDragging(false);
    setCounter(0);
  };

  const onDragEnter = (e) => {
    setCounter(counter + 1);
    setDragging(true);
  };

  const onDragLeave = (e) => {
    setCounter(counter - 1);
    if (counter <= 1) {
      setDragging(false);
    }
  };

  const removeImage = (file: File) => {
    setImages([...images.filter((image) => image.name !== file.name)]);
  };

  const onSubmit: SubmitHandler<Post> = async (data) => {
    setUpload(true);
    try {
      data.publishedAt = String(new Date().getTime());
      data.topicCid = props.topic?.cid ?? null;
      data.replyToCid = props.replyTo?.cid ?? null;
      console.log("post data!: ", data);
      const files = await Promise.all(
        [...images, video].map(async (item) => {
          if (!item) return null;
          const obj = {
            url: null,
            path: null,
            name: null,
            type: null,
          };
          if (item instanceof File) {
            obj.url = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = async () => resolve(reader.result);
              reader.readAsDataURL(item);
            });
            obj.name = item.name;
            obj.type = item.type;
          }

          if (typeof item === "string") {
            obj.path = item;
            obj.type = mime.lookup(extname(item));
            obj.name = item.split("\\").pop();
          }

          return obj;
        })
      );

      const res = await window.ipfs.createPost({
        post: data,
        files: files.filter((file) => Boolean(file)),
        pin: true,
      });
      console.log("posted!: ", res);
      if (res.errors.length > 0) {
        dispatchErrorDialog({
          type: "open",
          payload: res.errors.join(", "),
        });
      } else {
        const jwsObj = await account?.selfId?.did.createJWS(res.post);
        const resWakuSend = await window.waku.sendMessage({
          selfId: account?.selfId?.id,
          purpose: "share",
          jws: {
            payload: jwsObj.payload,
            signatures: jwsObj.signatures,
          },
        });
        console.log("share Post!: ", resWakuSend);
      }
    } catch (e) {
      dispatchErrorDialog({
        type: "open",
        payload: e.toString(),
      });
    } finally {
      setValue("content", "");
      setUpload(false);
      setImages([]);
      setVideo(null);
      props.doReload();
    }
  };

  const onError = (errors, e) => console.log(errors, e);

  return (
    <FlexRow width="90%" flexRef={parentFlexBox}>
      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <FlexRow alignItems="start">
          <AvatarIcon src={profile.avatar} />
          <Controller
            name="content"
            control={control}
            defaultValue={null}
            rules={{
              validate: (value) =>
                (!!value && value.length <= 2000) ||
                "2000文字以内で入力してください",
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label={`${
                  Boolean(props.replyTo) ? "返信" : "メッセージ"
                }を書き込む`}
                multiline
                minRows={3}
                error={Boolean(errors.content)}
                disabled={upload}
                onChange={(e) => {
                  setValue("content", e.target.value);
                  setContentLength(e.target.value?.length);
                }}
                helperText={`${contentLength}/2000`}
                onDrop={onDrop}
                onDragEnter={onDragEnter}
                onDragLeave={onDragLeave}
                sx={{
                  width: width,
                  borderColor: (theme) => theme.palette.primary.main,
                  borderStyle: dragging ? "dashed" : "none",
                  borderWidth: "5px",
                }}
              />
            )}
          />
        </FlexRow>
        <FlexRow justifyContent="start" marginTop="-10px" marginLeft="60px">
          <IconButton onClick={() => handleImageButton()} size="small">
            <ImageIcon />
          </IconButton>
          <IconButton onClick={() => handleVideoButton()} size="small">
            <LocalMoviesIcon />
          </IconButton>
        </FlexRow>
        <FlexRow justifyContent="start" marginTop="0px" marginLeft="60px">
          {images.map((image, index) => (
            <ImgPreview
              disabled={upload}
              key={image.name ?? index}
              file={image}
              onClose={() => removeImage(image)}
            />
          ))}
        </FlexRow>
        {Boolean(video) && (
          <FlexRow justifyContent="start" marginTop="0px" marginLeft="60px">
            <VideoPreview
              disabled={upload}
              file={video}
              onClose={() => setVideo(null)}
            />
          </FlexRow>
        )}
        <FlexRow justifyContent="end" marginTop="0px">
          <Button
            type="submit"
            variant="contained"
            disabled={!Boolean(account?.selfId?.id) || upload}
          >
            {upload ? "投稿中..." : "投稿する"}
          </Button>
        </FlexRow>
      </form>
    </FlexRow>
  );
};

export default InputPost;
