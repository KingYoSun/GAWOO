import { Post } from "@prisma/client";
import {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ProfileContext } from "../../context/ProfileContext";
import { TextField, Button } from "@mui/material";
import { FlexRow } from "../Flex";
import { AvatarIcon } from "../AvatarIcon";
import { AuthContext } from "../../context/AuthContext";
import { useForm, Controller, SubmitHandler } from "react-hook-form";

type InputPostProps = {
  target?: Post;
  doReload?: () => Promise<void>;
};

const emptyPost = {
  cid: null,
  content: "",
  published_at: null,
  authorDid: null,
};

const InputPost = (props: InputPostProps) => {
  const { account, dispatchAccount } = useContext(AuthContext);
  const { profile, dispatchProfile } = useContext(ProfileContext);
  const [contentLength, setContentLength] = useState(0);
  const [width, setWidth] = useState(0);
  const [upload, setUpload] = useState(false);
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
    if (Boolean(profile?.image?.original.src))
      setValue("authorAvatar", profile?.image?.original.src);
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

  const onSubmit: SubmitHandler<Post> = async (data) => {
    setUpload(true);
    try {
      data.published_at = new Date().getTime();
      console.log("post data!: ", data);
      const res = await window.ipfs.createPost(data, [], true);
      console.log("posted!: ", res);
      if (res.failures.length > 0) {
        alert("Error!: " + res.failures.join(", "));
      }
    } catch (e) {
      console.log("Error!: ", e.toString());
    } finally {
      setValue("content", "");
      setUpload(false);
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
                label="メッセージを書き込む"
                multiline
                minRows={3}
                error={Boolean(errors.content)}
                disabled={upload}
                onChange={(e) => {
                  setValue("content", e.target.value);
                  setContentLength(e.target.value?.length);
                }}
                helperText={`${contentLength}/2000`}
                sx={{ width: width }}
              />
            )}
          />
        </FlexRow>
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
