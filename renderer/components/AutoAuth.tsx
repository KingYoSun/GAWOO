import { ReactNode, useContext, useEffect } from "react";

import { AuthContext } from "../context/AuthContext";
import { ProfileContext } from "../context/ProfileContext";
import { LoadingContext } from "../context/LoadingContext";
import { SetupContext } from "../context/SetupContext";
import { ErrorDialogContext } from "../context/ErrorDialogContext";
import { NoticeCountContext } from "../context/NoticeCountContext";

type Props = {
  children: ReactNode;
};

const AutoAuth = ({ children }: Props) => {
  const { account, dispatchAccount } = useContext(AuthContext);
  const { profile, dispatchProfile } = useContext(ProfileContext);
  const { loading, dispatchLoading } = useContext(LoadingContext);
  const { setup, dispatchSetup } = useContext(SetupContext);
  const { errorDialog, dispatchErrorDialog } = useContext(ErrorDialogContext);
  const { noticeCount, dispatchNoticeCount } = useContext(NoticeCountContext);

  const getProfile = async () => {
    try {
      const newProfile = await account.getMyProfile();
      dispatchProfile({ type: "set", payload: newProfile });
    } catch (e) {
      dispatchErrorDialog({
        type: "open",
        payload: e,
      });
    }
  };

  const fetchImage = async (key) => {
    const res = await window.ipfs.catImage(
      profile[key].original.src,
      profile[key].original.mimeType
    );
    console.log(`fetched ${key}!`);
    return res;
  };

  const countUnreadNotice = async (did) => {
    const unreadNoticeCount = await window.electron.countUnreadNotice(did);
    dispatchNoticeCount({ type: "set", payload: unreadNoticeCount });
  };

  useEffect(() => {
    window.electron.addedNotice(() => {
      if (Boolean(account?.selfId?.id)) {
        countUnreadNotice(account.selfId.id);
      }
    });
  }, []);

  useEffect(() => {
    if (!setup.ipfs) return;

    const loadingMsg = "ログイン中...";

    if (typeof account !== "undefined" && !account?.isConnected()) {
      (async () => {
        try {
          dispatchLoading({ type: "add", payload: loadingMsg });
          const newAccount = await account.authenticate();
          dispatchAccount({ type: "set", payload: newAccount });
          if (!profile.name) await getProfile();
          dispatchLoading({ type: "remove", payload: loadingMsg });
        } catch (e) {
          dispatchErrorDialog({
            type: "open",
            payload: e,
          });
        }
      })();
    }

    if (account?.isConnected() && !profile?.name) {
      (async () => {
        dispatchLoading({ type: "add", payload: loadingMsg });
        await getProfile();
        dispatchLoading({ type: "remove", payload: loadingMsg });
      })();
    }
  }, [setup.ipfs]);

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
    if (Boolean(profile?.background?.original.src)) {
      console.log("fetch background!");
      (async () => {
        const newBgImg = await fetchImage("background");
        dispatchProfile({ type: "setBgImg", payload: newBgImg });
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.background?.original.src]);

  useEffect(() => {
    if (Boolean(account?.selfId?.id)) {
      countUnreadNotice(account.selfId.id);
    }
    if (
      Boolean(account?.selfId?.id) &&
      (Boolean(profile?.name) || Boolean(profile?.image?.original.src))
    ) {
      (async () => {
        const myUser = await window.electron.showUser(account.selfId.id);
        if (typeof myUser === "string") {
          console.log(myUser);
          return;
        }

        if (myUser === null) {
          const res = await window.electron.createUser({
            id: 0,
            did: account.selfId.id,
            name: profile.name,
            avatar: profile?.image?.original.src,
          });
          console.log("add user!: ", res);
        }

        if (
          Boolean(myUser) &&
          (myUser.name !== profile.name ||
            myUser.avatar !== profile?.image?.original.src)
        ) {
          const res = await window.electron.updateUser({
            id: myUser.id,
            did: account?.selfId?.id,
            name: profile.name,
            avatar: profile?.image?.original.src,
          });
          console.log("update user!: ", res);
        }
      })();
    }
  }, [account?.selfId?.id, profile?.name, profile?.image?.original.src]);

  return <>{children}</>;
};

export default AutoAuth;
