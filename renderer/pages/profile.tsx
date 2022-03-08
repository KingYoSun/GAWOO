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
import ReactCrop, { Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  cropPreview,
  onSelectFile,
  onImageLoad,
  uploadImageToIpfs,
  cancelCrop,
} from "../utils/crop-image-utils";
import { cropToUrl } from "../utils/crop-to-url";

import { AuthContext } from "../context/AuthContext";
import { ProfileContext } from "../context/ProfileContext";

interface CropImageInterface {
  nowEdit: Boolean;
  src?: string;
  crop?: Crop;
  completedCrop?: PixelCrop;
  scale: number;
  rotate: number;
  mimeType?: string;
  width?: number;
  height?: number;
  size?: number;
  aspect?: number;
  input: boolean;
}

const ProfilePage = () => {
  const { account, dispatchAccount } = useContext(AuthContext);
  const { profile, dispatchProfile } = useContext(ProfileContext);

  const showAccount = () => {
    console.log("account: ", account);
    console.log("profile: ", profile);
  };

  const getProfile = async () => {
    if (!account?.isConnected()) return;

    const newProfile = await account.getMyProfile();
    dispatchProfile({
      type: "set",
      payload: newProfile,
    });
  };

  const handleUpdateProfile = (key, value) => {
    const newProfile = profile;
    newProfile[key] = value;
    dispatchProfile({
      type: "set",
      payload: newProfile,
    });
    setValue(key as keyof BasicProfile, value as any);
  };

  const initImage = {
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
    aspect: 1,
    input: true,
  };

  const imgRefAvatar = useRef(null);
  const previewCanvasRefAvatar = useRef(null);
  const initAvatar = JSON.parse(JSON.stringify(initImage));
  const [avatar, setAvatar] = useState<CropImageInterface>(initAvatar);

  const imgRefBg = useRef(null);
  const previewCanvasRefBg = useRef(null);
  const initBg = {
    ...initImage,
    aspect: 4,
  };
  const [bg, setBg] = useState<CropImageInterface>(initBg);

  const updateAvatarCropPreview = useCallback(() => {
    if (
      avatar.completedCrop &&
      previewCanvasRefAvatar.current &&
      imgRefAvatar.current
    ) {
      cropPreview(
        imgRefAvatar.current,
        previewCanvasRefAvatar.current,
        avatar.completedCrop
      );
    }
  }, [avatar.completedCrop, avatar.scale, avatar.rotate]);

  const updateBgCropPreview = useCallback(() => {
    if (bg.completedCrop && previewCanvasRefBg.current && imgRefBg.current) {
      cropPreview(
        imgRefBg.current,
        previewCanvasRefBg.current,
        bg.completedCrop
      );
    }
  }, [bg.completedCrop, bg.scale, bg.rotate]);

  const SubmitImageToAvatar = () => {
    const dataUrl = cropToUrl(
      previewCanvasRefAvatar.current,
      avatar.completedCrop
    );
    setAvatar({
      ...avatar,
      src: dataUrl,
      mimeType: "image/png",
      width: previewCanvasRefAvatar.current.width,
      height: previewCanvasRefAvatar.current.height,
      size: dataUrl?.length,
      nowEdit: false,
    });

    console.log(profile);
  };

  const SubmitImageToBg = () => {
    const dataUrl = cropToUrl(previewCanvasRefBg.current, bg.completedCrop);
    setBg({
      ...bg,
      src: dataUrl,
      mimeType: "image/png",
      width: previewCanvasRefBg.current.width,
      height: previewCanvasRefBg.current.height,
      size: dataUrl?.length,
      nowEdit: false,
    });

    console.log(profile);
  };

  useEffect(() => {
    updateAvatarCropPreview();
  }, [updateAvatarCropPreview]);

  useEffect(() => {
    updateBgCropPreview();
  }, [updateBgCropPreview]);

  const { control, handleSubmit, setValue } = useForm<BasicProfile>({
    defaultValues: profile as BasicProfile,
    mode: "onSubmit",
  });

  useEffect(() => {
    for (const [key, value] of Object.entries(profile)) {
      setValue(key as keyof BasicProfile, value as any);
    }
  }, [profile]);

  const onError = (errors, e) => console.log(errors, e);

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
    await Promise.all([
      (async () => {
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
          delete data["avatar"];
        }
      })(),

      (async () => {
        if (!!bg.src && !regIpfsObj.test(bg.src)) {
          const ipfsUrl = await uploadImageToIpfs(bg.src);

          const newBg: ImageSources = {
            original: {
              src: ipfsUrl,
              mimeType: bg.mimeType,
              width: bg.width,
              height: bg.height,
              size: bg.size,
            },
          };
          data["background"] = newBg;
          delete data["bgImg"];
        }
      })(),
    ]);

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

  return (
    <>
      <FlexRow justifyContent="start">
        <h1>プロフィール編集</h1>
        <Button onClick={showAccount} sx={{ marginLeft: 1 }}>
          アカウント確認
        </Button>
      </FlexRow>
      <FlexRow justifyContent="start">
        {avatar.input && (
          <input
            accept="image/*"
            id="input-avatar"
            multiple
            type="file"
            onChange={(e) => onSelectFile(e, avatar, setAvatar)}
            hidden
          />
        )}
        <label htmlFor="input-avatar">
          <Button variant="contained" component="span">
            アイコン画像選択
          </Button>
        </label>
      </FlexRow>
      {!avatar.nowEdit && (Boolean(avatar.src) || Boolean(profile.avatar)) && (
        <FlexRow justifyContent="start">
          <Avatar
            alt="my avatar"
            src={avatar.src ?? profile.avatar}
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
                    maxHeight: "250px",
                    maxWidth: "250px",
                  }}
                  onLoad={(e) =>
                    onImageLoad(e, avatar, setAvatar, imgRefAvatar)
                  }
                />
              </ReactCrop>
              <Box marginLeft={1}>
                <canvas
                  ref={previewCanvasRefAvatar}
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
              <Button
                variant="outlined"
                onClick={() => {
                  cancelCrop(
                    initAvatar,
                    setAvatar,
                    imgRefAvatar,
                    previewCanvasRefAvatar
                  );
                  let obj = document.getElementById(
                    "input-avatar"
                  ) as HTMLInputElement;
                  obj.value = null;
                }}
                sx={{ marginLeft: 1 }}
              >
                キャンセル
              </Button>
            </FlexRow>
          </Box>
        </FlexRow>
      )}
      <FlexRow justifyContent="start" marginTop={3}>
        {bg.input && (
          <input
            accept="image/*"
            id="input-bg"
            multiple
            type="file"
            onChange={(e) => onSelectFile(e, bg, setBg)}
            hidden
          />
        )}
        <label htmlFor="input-bg">
          <Button variant="contained" component="span">
            背景画像選択
          </Button>
        </label>
      </FlexRow>
      {!bg.nowEdit && (Boolean(bg.src) || Boolean(profile.bgImg)) && (
        <FlexRow justifyContent="start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="my background image"
            src={bg.src ?? profile.bgImg}
            style={{
              width: "400px",
              height: "100px",
            }}
          />
        </FlexRow>
      )}
      {bg.nowEdit && Boolean(bg.src) && (
        <FlexRow justifyContent="start">
          <Box>
            <FlexRow>
              <ReactCrop
                crop={bg.crop}
                keepSelection
                onChange={(_, newCrop) => setBg({ ...bg, crop: newCrop })}
                onComplete={(c) => setBg({ ...bg, completedCrop: c })}
                aspect={4}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="crop background"
                  src={bg.src}
                  style={{
                    transform: `scale(${bg.scale}) rotate(${bg.rotate}deg)`,
                    maxHeight: "400px",
                    maxWidth: "400px",
                  }}
                  onLoad={(e) => onImageLoad(e, bg, setBg, imgRefBg)}
                />
              </ReactCrop>
              <Box marginLeft={1}>
                <canvas
                  ref={previewCanvasRefBg}
                  style={{
                    // Rounding is important for sharpness.
                    width: Math.floor(bg.completedCrop?.width ?? 0),
                    height: Math.floor(bg.completedCrop?.height ?? 0),
                  }}
                />
              </Box>
            </FlexRow>
            <FlexRow>
              <Button variant="outlined" onClick={SubmitImageToBg}>
                確定
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  cancelCrop(initBg, setBg, imgRefBg, previewCanvasRefBg);
                  let obj = document.getElementById(
                    "input-bg"
                  ) as HTMLInputElement;
                  obj.value = null;
                }}
                sx={{ marginLeft: 1 }}
              >
                キャンセル
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
