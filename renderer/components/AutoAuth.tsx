import { ReactNode, useContext, useEffect } from "react";

import { AuthContext } from "../context/AuthContext";
import { ProfileContext } from "../context/ProfileContext";

type Props = {
  children: ReactNode;
};

const AutoAuth = ({ children }: Props) => {
  const { account, dispatchAccount } = useContext(AuthContext);
  const { profile, dispatchProfile } = useContext(ProfileContext);

  const getProfile = async () => {
    const newProfile = await account.getMyProfile();
    dispatchProfile({
      type: "set",
      payload: newProfile,
    });
  };

  const fetchAvatar = async () => {
    const avatar = await window.ipfs.catImage(
      profile.image.original.src,
      profile.image.original.mimeType
    );
    dispatchProfile({
      type: "set",
      payload: {
        ...profile,
        avatar: avatar,
      },
    });
    console.log("fetched avatar!");
  };

  useEffect(() => {
    if (typeof account !== "undefined" && !account?.isConnected()) {
      (async () => {
        const newAccount = await account.authenticate();
        dispatchAccount({
          type: "set",
          payload: newAccount,
        });
        if (!profile.name) getProfile();
      })();
    }

    if (account?.isConnected() && !profile.name) {
      getProfile();
    }
  }, []);

  useEffect(() => {
    if (Boolean(profile?.image?.original.src) && !Boolean(profile?.avatar)) {
      console.log("fetch avatar!");
      (async () => {
        await fetchAvatar();
      })();
    }
  }, [profile]);

  return <>{children}</>;
};

export default AutoAuth;
