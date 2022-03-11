import { ReactNode, useContext, useEffect } from "react";

import { AuthContext } from "../context/AuthContext";
import { ProfileContext } from "../context/ProfileContext";
import { LoadingContext } from "../context/LoadingContext";
import { SetupContext } from "../context/SetupContext";

type Props = {
  children: ReactNode;
};

const AutoAuth = ({ children }: Props) => {
  const { account, dispatchAccount } = useContext(AuthContext);
  const { profile, dispatchProfile } = useContext(ProfileContext);
  const { loading, dispatchLoading } = useContext(LoadingContext);
  const { setup, dispatchSetup } = useContext(SetupContext);

  const getProfile = async () => {
    const newProfile = await account.getMyProfile();
    dispatchProfile({ type: "set", payload: newProfile });
  };

  const fetchImage = async (key) => {
    const res = await window.ipfs.catImage(
      profile[key].original.src,
      profile[key].original.mimeType
    );
    console.log(`fetched ${key}!`);
    return res;
  };

  useEffect(() => {
    if (!setup) return;

    const loadingMsg = "ログイン中...";

    if (typeof account !== "undefined" && !account?.isConnected()) {
      (async () => {
        dispatchLoading({ type: "add", payload: loadingMsg });
        const newAccount = await account.authenticate();
        dispatchAccount({ type: "set", payload: newAccount });
        if (!profile.name) await getProfile();
        dispatchLoading({ type: "remove", payload: loadingMsg });
      })();
    }

    if (account?.isConnected() && !profile.name) {
      (async () => {
        dispatchLoading({ type: "add", payload: loadingMsg });
        await getProfile();
        dispatchLoading({ type: "remove", payload: loadingMsg });
      })();
    }
  }, [setup]);

  useEffect(() => {
    if (Boolean(profile?.image?.original.src)) {
      console.log("fetch avatar!");
      (async () => {
        const newAvatarImg = await fetchImage("image");
        dispatchProfile({ type: "setAvatar", payload: newAvatarImg });
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.image?.original.src]);

  useEffect(() => {
    if (Boolean(profile?.image?.original.src)) {
      console.log("fetch background!");
      (async () => {
        const newBgImg = await fetchImage("background");
        dispatchProfile({ type: "setBgImg", payload: newBgImg });
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.background?.original.src]);

  return <>{children}</>;
};

export default AutoAuth;
