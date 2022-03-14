import { ReactNode, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { SetupContext } from "../context/SetupContext";
import { WakuClientProps } from "../types/general";

type Props = {
  children: ReactNode;
};

const Subscribe = ({ children }: Props) => {
  const { account, dispatchAccount } = useContext(AuthContext);
  const { setup, dispatchSetup } = useContext(SetupContext);

  useEffect(() => {
    window.waku.followMessage((msg: string) => {
      console.log("followed!: ", msg);
    });
    window.waku.sharePost((msg: string) => {
      console.log("shared post!: ", msg);
    });
  }, []);

  useEffect(() => {
    if (!Boolean(account?.selfId?.id) || !setup) return;

    const wakuIsConnected = window.waku.isConnected();
    if (!wakuIsConnected) {
      alert("Wakuが起動していません");
      console.log("waku is not running");
      return;
    }

    const wakuPropsFollow: WakuClientProps = {
      selfId: account?.selfId?.id,
      purpose: "follow",
    };
    const wakuPropsShare: WakuClientProps = {
      selfId: account?.selfId?.id,
      purpose: "share",
    };

    let newWaku = window.waku.deleteObservers([
      wakuPropsFollow,
      wakuPropsShare,
    ]);
    newWaku = window.waku.addObservers([wakuPropsFollow, wakuPropsShare]);
  }, [account?.selfId?.id, setup]);

  return <>{children}</>;
};

export default Subscribe;
