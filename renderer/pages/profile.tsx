import React, { useContext, useEffect } from "react";
import { BasicProfile } from "../types/general";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { Button, TextField } from "@mui/material";
import { FlexRow } from "../components/Flex";

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
