import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { BasicProfile } from "../types/general";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { TextField, Button } from "@mui/material";
import AccountUtils from "../utils/identity/account-utils";
import { type } from "os";

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
  const [account] = useState(new AccountUtils());
  const [profile, setProfile] = useState(defaultProfile);

  const onAccountConnect = async () => {
    await account.authenticate();
  };

  const onGetProfile = async () => {
    const resProfile: BasicProfile = await account.getBasicProfile();
    if (!resProfile) return;

    setProfile(resProfile);
    for (const [key, value] of Object.entries(resProfile)) {
      setValue(key as keyof BasicProfile, value);
    }
  };

  const onDeleteConnection = async () => {
    await account.deleteConnection();
  };

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
        <Button onClick={onAccountConnect}>認証</Button>
        <Button onClick={onDeleteConnection}>切断</Button>
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
