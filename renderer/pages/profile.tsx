import React, {useEffect, useState} from 'react';
import Layout from '../components/Layout';
import {BasicProfile} from '../../../hinan/renderer/types/general';
import {useForm, Controller, SubmitHandler} from 'react-hook-form';
import {TextField, Button} from '@mui/material';
import AccountUtils from '../utils/identity/account-utils';

const defaultProfile: BasicProfile = {
  name: null,
  image: null,
  description: null,
  emoji: null,
  background: null,
  birthDate: null,
  url: null,
  gender: null,
  homeLocation: null,
  residenceCountry: null,
  nationalities: null,
};

const ProfilePage = () => {
  const [account] = useState(new AccountUtils());
  const [profile, setProfile] = useState(defaultProfile);

  const onAccountConnect = () => {
    account.authenticate();
  };

  const {control, handleSubmit} = useForm<BasicProfile>({
    defaultValues: profile,
    mode: 'onChange',
  });
  const onSubmit: SubmitHandler<BasicProfile> = (data) => {
    account.updateProfile(data);
  };

  useEffect(() => {
    (async () => {
      const resProfile: BasicProfile = await account.getBasicProfile();
      setProfile(resProfile);
    });
  }, [account]);


  return (
    <Layout>
      <h1>プロフィール編集</h1>
      <div>
        <Button onClick={onAccountConnect}>認証</Button>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label>
          ユーザー名
          <Controller
            name='name'
            control={control}
            defaultValue=''
            render={({field}) => <TextField {...field} />}
          />
        </label>
        <Button type='submit' variant='outlined'>プロフィールを更新</Button>
      </form>
    </Layout>
  );
};

export default ProfilePage;
