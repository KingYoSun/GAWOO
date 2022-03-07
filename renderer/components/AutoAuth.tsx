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

  return <>{children}</>;
};

export default AutoAuth;
