import React, { useContext, useEffect } from "react";
import { BasicProfile } from "../types/general";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { Button, TextField } from "@mui/material";
import { FlexRow } from "../components/Flex";
import DateAdapter from "@mui/lab/AdapterMoment";
import DesktopDatePicker from "@mui/lab/DesktopDatePicker";
import LocalizationProvider from "@mui/lab/LocalizationProvider";

import { AuthContext } from "../context/AuthContext";
import { ProfileContext } from "../context/ProfileContext";

const ProfilePage = () => {
  const { account, dispatchAccount } = useContext(AuthContext);
  const { profile, dispatchProfile } = useContext(ProfileContext);

  const showAccount = () => {
    console.log("account: ", account);
    console.log("profile: ", profile);
  };

  const { control, handleSubmit, setValue } = useForm<BasicProfile>({
    defaultValues: profile as BasicProfile,
    mode: "onChange",
  });

  useEffect(() => {
    for (const [key, value] of Object.entries(profile)) {
      setValue(key as keyof BasicProfile, value as any);
    }
  }, [profile]);

  const getProfile = async () => {
    if (!account?.isConnected()) return;

    const newProfile = await account.getBasicProfile();
    dispatchProfile({
      type: "set",
      payload: newProfile,
    });
  };

  const onSubmit: SubmitHandler<BasicProfile> = async (data) => {
    Object.keys(data).forEach((key) => {
      if (
        !data[key] ||
        (typeof data[key] === "object" && data[key].length === 0)
      ) {
        delete data[key];
      }
    });
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

  return (
    <>
      <FlexRow justifyContent="start">
        <h1>プロフィール編集</h1>
        <Button onClick={showAccount} sx={{ marginLeft: 1 }}>
          アカウント確認
        </Button>
      </FlexRow>
      <FlexRow justifyContent="start">
        <form onSubmit={handleSubmit(onSubmit)}>
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
            <Controller
              name="birthDate"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <LocalizationProvider dateAdapter={DateAdapter}>
                  <DesktopDatePicker
                    {...field}
                    label="誕生日"
                    inputFormat="yyyy/MM/DD"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        required={false}
                        sx={{ minWidth: "300px" }}
                      />
                    )}
                  />
                </LocalizationProvider>
              )}
            />
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
