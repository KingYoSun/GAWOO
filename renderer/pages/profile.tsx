import React, {
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { BasicProfile, ImageSources } from "../types/general";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { Button, TextField, Box, Avatar } from "@mui/material";
import { FlexRow } from "../components/Flex";
import DateAdapter from "@mui/lab/AdapterDateFns";
import DesktopDatePicker from "@mui/lab/DesktopDatePicker";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import jaLocale from "date-fns/locale/ja";
import { format, parse } from "date-fns";
import ReactCrop, {
  Crop,
  PixelCrop,
  makeAspectCrop,
  centerCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { cropPreview } from "../utils/crop-preview";
import { cropToUrl } from "../utils/crop-to-url";

import { AuthContext } from "../context/AuthContext";
import { ProfileContext } from "../context/ProfileContext";

interface UploadAvatarInterface {
  nowEdit: Boolean;
  src: string | null;
  crop: Crop | null;
  completedCrop: PixelCrop | null;
  scale: number;
  rotate: number;
  mimeType: string | null;
  width: number | null;
  height: number | null;
  size: number | null;
}

const ProfilePage = () => {
  const { account, dispatchAccount } = useContext(AuthContext);
  const { profile, dispatchProfile } = useContext(ProfileContext);

  const showAccount = () => {
    console.log("account: ", account);
    console.log("profile: ", profile);
  };

  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const [avatar, setAvatar] = useState<UploadAvatarInterface>({
    nowEdit: false,
    src: null,
    crop: null,
    completedCrop: null,
    scale: 1,
    rotate: 0,
    mimeType: null,
    width: null,
    height: null,
    size: null,
  });

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAvatar({ ...avatar, crop: undefined });
      const reader = new FileReader();
      reader.addEventListener("load", () =>
        setAvatar({
          ...avatar,
          src: reader.result.toString() || "",
          nowEdit: true,
        })
      );
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    imgRef.current = e.currentTarget;
    const { width, height } = e.currentTarget;
    const newCrop = centerCrop(
      makeAspectCrop(
        {
          unit: "%",
          width: 90,
        },
        1,
        width,
        height
      ),
      width,
      height
    );
    setAvatar({
      ...avatar,
      crop: newCrop,
    });
  };

  const updateCropPreview = useCallback(() => {
    if (avatar.completedCrop && previewCanvasRef.current && imgRef.current) {
      cropPreview(
        imgRef.current,
        previewCanvasRef.current,
        avatar.completedCrop,
        avatar.scale,
        avatar.rotate
      );
    }
  }, [avatar.completedCrop, avatar.scale, avatar.rotate]);

  const SubmitImageToAvatar = () => {
    const dataUrl = cropToUrl(previewCanvasRef.current, avatar.completedCrop);
    setAvatar({
      ...avatar,
      src: dataUrl,
      mimeType: "image/png",
      width: previewCanvasRef.current.width,
      height: previewCanvasRef.current.height,
      size: dataUrl?.length,
      nowEdit: false,
    });
    handleUpdateProfile("image", 1); //handleSubmitを発火させるため

    console.log(profile);
  };

  const uploadImageToIpfs = async (dataUrl) => {
    const ipfsUrls = await window.ipfs.imageToIpfs([dataUrl], true);
    console.log("ipfsUploaded!: ", ipfsUrls);
    if (ipfsUrls?.failures.length > 0) {
      console.log("image upload to ipfs failures!: ", ipfsUrls?.failures);
      alert(`画像のアップロードに失敗しました: ${ipfsUrls?.failures[0]}`);
    }
    if (ipfsUrls?.successes.length === 0) {
      return null;
    }

    console.log("uploaded image to ipfs is succeeded!");
    return `ipfs://${ipfsUrls.successes[0].path}`;
  };

  useEffect(() => {
    updateCropPreview();
  }, [updateCropPreview]);

  const { control, handleSubmit, setValue } = useForm<BasicProfile>({
    defaultValues: profile as BasicProfile,
    mode: "onSubmit",
  });

  useEffect(() => {
    for (const [key, value] of Object.entries(profile)) {
      setValue(key as keyof BasicProfile, value as any);
    }
  }, [profile]);

  const getProfile = async () => {
    if (!account?.isConnected()) return;

    const newProfile = await account.getMyProfile();
    dispatchProfile({
      type: "set",
      payload: newProfile,
    });
  };

  const onSubmit: SubmitHandler<BasicProfile> = async (data) => {
    console.log("start submit profile!");
    Object.keys(data).forEach((key) => {
      if (
        !data[key] ||
        (typeof data[key] === "object" && data[key].length === 0)
      ) {
        delete data[key];
      }
    });
    if (!!data["birthDate"] && data["birthDate"] instanceof Date)
      data["birthDate"] = format(data["birthDate"] as Date, "yyyy-MM-dd");

    const regIpfsObj = new RegExp("^ipfs://.+", "i");
    if (!!avatar.src && !regIpfsObj.test(avatar.src)) {
      const ipfsUrl = await uploadImageToIpfs(avatar.src);

      const newAvatar: ImageSources = {
        original: {
          src: ipfsUrl,
          mimeType: avatar.mimeType,
          width: avatar.width,
          height: avatar.height,
          size: avatar.size,
        },
      };
      data["image"] = newAvatar;
    }
    console.log("post profile: ", data);
    await account.updateProfile(data);
    await getProfile();
  };

  const regURL = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  );

  const handleUpdateProfile = (key, value) => {
    const newProfile = profile;
    newProfile[key] = value;
    dispatchProfile({
      type: "set",
      payload: newProfile,
    });
    setValue(key as keyof BasicProfile, value as any);
  };

  const onError = (errors, e) => console.log(errors, e);

  return (
    <>
      <FlexRow justifyContent="start">
        <h1>プロフィール編集</h1>
        <Button onClick={showAccount} sx={{ marginLeft: 1 }}>
          アカウント確認
        </Button>
      </FlexRow>
      <FlexRow justifyContent="start">
        <input
          accept="image/*"
          id="input-avatar"
          multiple
          type="file"
          onChange={onSelectFile}
          hidden
        />
        <label htmlFor="input-avatar">
          <Button variant="contained" component="span">
            アイコン画像選択
          </Button>
        </label>
      </FlexRow>
      {!avatar.nowEdit && Boolean(avatar.src) && (
        <FlexRow justifyContent="start">
          <Avatar
            alt="my avatar"
            src={avatar.src}
            sx={{ width: "100px", height: "100px" }}
          />
        </FlexRow>
      )}
      {avatar.nowEdit && Boolean(avatar.src) && (
        <FlexRow justifyContent="start">
          <Box>
            <FlexRow>
              <ReactCrop
                crop={avatar.crop}
                keepSelection
                onChange={(_, newCrop) =>
                  setAvatar({ ...avatar, crop: newCrop })
                }
                onComplete={(c) => setAvatar({ ...avatar, completedCrop: c })}
                aspect={1}
                circularCrop
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="crop avatar"
                  src={avatar.src}
                  style={{
                    transform: `scale(${avatar.scale}) rotate(${avatar.rotate}deg)`,
                  }}
                  onLoad={onImageLoad}
                />
              </ReactCrop>
              <Box marginLeft={1}>
                <canvas
                  ref={previewCanvasRef}
                  style={{
                    // Rounding is important for sharpness.
                    width: Math.floor(avatar.completedCrop?.width ?? 0),
                    height: Math.floor(avatar.completedCrop?.height ?? 0),
                    borderRadius: "50% 50%",
                  }}
                />
              </Box>
            </FlexRow>
            <FlexRow>
              <Button variant="outlined" onClick={SubmitImageToAvatar}>
                確定
              </Button>
            </FlexRow>
          </Box>
        </FlexRow>
      )}
      <FlexRow justifyContent="start" marginTop={3}>
        <form onSubmit={handleSubmit(onSubmit, onError)}>
          <FlexRow justifyContent="start">
            <Controller
              name="name"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="ユーザー名"
                  sx={{ minWidth: "300px" }}
                />
              )}
            />
          </FlexRow>
          <FlexRow justifyContent="start" marginTop="20px">
            <Controller
              name="description"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="説明"
                  multiline
                  sx={{ minWidth: "300px" }}
                />
              )}
            />
          </FlexRow>
          <FlexRow justifyContent="start" marginTop="20px">
            <LocalizationProvider dateAdapter={DateAdapter} locale={jaLocale}>
              <Controller
                name="birthDate"
                control={control}
                defaultValue=""
                rules={{
                  validate: (value) =>
                    value == null ||
                    (typeof value === "string" &&
                      parse(value, "yyyy-MM-dd", new Date()) instanceof Date) ||
                    (value instanceof Date && !Number.isNaN(value?.getDate())),
                }}
                render={({ field }) => (
                  <DesktopDatePicker
                    {...field}
                    label="誕生日"
                    mask="____-__-__"
                    inputFormat="yyyy-MM-dd"
                    renderInput={(params) => (
                      <TextField {...params} sx={{ minWidth: "300px" }} />
                    )}
                  />
                )}
              />
            </LocalizationProvider>
          </FlexRow>
          <FlexRow justifyContent="start" marginTop="20px">
            <Controller
              name="url"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  error={!!profile.url && !regURL.test(profile.url)}
                  label="URL"
                  onChange={(event) =>
                    handleUpdateProfile("url", event.target.value)
                  }
                  sx={{ minWidth: "300px" }}
                />
              )}
            />
          </FlexRow>
          <FlexRow justifyContent="start" marginTop="20px">
            <Controller
              name="homeLocation"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="現在地"
                  sx={{ minWidth: "300px" }}
                />
              )}
            />
          </FlexRow>
          <FlexRow justifyContent="start" marginTop="35px">
            <Button type="submit" variant="outlined">
              プロフィールを更新
            </Button>
          </FlexRow>
        </form>
      </FlexRow>
    </>
  );
};

export default ProfilePage;
