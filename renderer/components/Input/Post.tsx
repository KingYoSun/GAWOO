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

interface InputPostProps {
  target: Post;
}

const emptyPost = {
  cid: null,
  content: "",
  published_at: null,
  authorDid: null,
};

const InputPost = ({ target: Post }: InputPostProps): JSX.Element => {
  const { account, dispatchAccount } = useContext(AuthContext);
  const { profile, dispatchProfile } = useContext(ProfileContext);
  const [contentLength, setContentLength] = useState(0);
  const [width, setWidth] = useState(0);
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

  useLayoutEffect(() => {
    const updateSize = () => {
      setWidth(parentFlexBox?.current?.clientWidth * 0.75);
    };
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const onSubmit: SubmitHandler<Post> = async (data) => {
    data.published_at = new Date().getTime();
    console.log("post data!: ", data);
  };

  const onError = (errors, e) => console.log(errors, e);

  return (
    <FlexRow width="90%" myRef={parentFlexBox}>
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
            disabled={!Boolean(account?.selfId?.id)}
          >
            投稿する
          </Button>
        </FlexRow>
      </form>
    </FlexRow>
  );
};

export default InputPost;
