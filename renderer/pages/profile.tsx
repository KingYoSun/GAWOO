import React, { useEffect, useState, useContext, useCallback } from "react";
import Layout from "../components/Layout";
import { BasicProfile } from "../types/general";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { TextField, Button } from "@mui/material";
import * as ErrorMsg from "../utils/error-msg";

import { AuthContext } from "../context/AuthContext";

const defaultProfile: BasicProfile = {
  name: "",
  image: null,
  description: "",
  emoji: null,
  background: null,
  birthDate: null,
  url: "",
  gender: "",
  homeLocation: "",
  residenceCountry: "",
  nationalities: [],
};

const ProfilePage = () => {
  const { account, setAccount } = useContext(AuthContext);
  const [profile, setProfile] = useState(defaultProfile);

  const showAccount = () => {
    console.log(account);
  };

  const onGetProfile = useCallback(async () => {
    if (!account?.isConnected()) {
      return;
    }

    const resProfile: BasicProfile = await account.getBasicProfile();

    if (!resProfile) return;

    setProfile(resProfile);
    for (const [key, value] of Object.entries(resProfile)) {
      setValue(key as keyof BasicProfile, value);
    }
  }, [account]);

  useEffect(() => {
    onGetProfile();
  }, []);

  const { control, handleSubmit, setValue } = useForm<BasicProfile>({
    defaultValues: profile,
    mode: "onChange",
  });
  const onSubmit: SubmitHandler<BasicProfile> = (data) => {
    Object.keys(data).forEach((key) => {
      if (
        !data[key] ||
        (typeof data[key] === "object" && data[key].length === 0)
      ) {
        delete data[key];
      }
    });
    console.log("post profile: ", data);
    account.updateProfile(data);
  };

  return (
    <Layout>
      <h1>プロフィール編集</h1>
      <div>
        <Button onClick={showAccount}>アカウント確認</Button>
        <Button onClick={onGetProfile}>プロフィール取得</Button>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label>
          ユーザー名
          <Controller
            name="name"
            control={control}
            defaultValue=""
            render={({ field }) => <TextField {...field} />}
          />
        </label>
        <Button type="submit" variant="outlined">
          プロフィールを更新
        </Button>
      </form>
    </Layout>
  );
};

export default ProfilePage;
