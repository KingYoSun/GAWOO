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

  const fetchImage = async (key) => {
    const res = await window.ipfs.catImage(
      profile[key].original.src,
      profile[key].original.mimeType
    );
    console.log("fetched image!");
    return res;
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
    if (Boolean(profile?.image?.original.src)) {
      console.log("fetch avatar!");
      (async () => {
        const newAvatarImg = await fetchImage("image");
        dispatchProfile({
          type: "setAvatar",
          payload: newAvatarImg,
        });
      })();
    }
  }, [profile?.image?.original.src]);

  useEffect(() => {
    if (Boolean(profile?.image?.original.src)) {
      console.log("fetch background!");
      (async () => {
        const newBgImg = await fetchImage("background");
        dispatchProfile({
          type: "setBgImg",
          payload: newBgImg,
        });
      })();
    }
  }, [profile?.background?.original.src]);

  return <>{children}</>;
};

export default AutoAuth;
