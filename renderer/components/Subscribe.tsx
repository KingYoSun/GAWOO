import { ReactNode, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { WakuClientProps } from "../types/general";
import { SetupContext } from "../context/SetupContext";
import { LoadingContext } from "../context/LoadingContext";

type Props = {
  children: ReactNode;
};

const Subscribe = ({ children }: Props) => {
  const { account, dispatchAccount } = useContext(AuthContext);
  const { setup, dispatchSetup } = useContext(SetupContext);
  const { loading, dispatchLoading } = useContext(LoadingContext);

  const wakuSetupMsg = "Wakuの接続中...";

  useEffect(() => {
    if (!setup.waku) dispatchLoading({ type: "add", payload: wakuSetupMsg });
    if (setup.waku) dispatchLoading({ type: "remove", payload: wakuSetupMsg });

    window.waku.followMessage((msg: string) => {
      console.log("followed!: ", msg);
    });
    window.waku.sharePost((msg: string) => {
      console.log("shared post!: ", msg);
    });
    window.waku.setup((flag: boolean) => {
      if (flag) {
        dispatchSetup({ type: "waku", payload: true });
        dispatchLoading({ type: "remove", payload: wakuSetupMsg });
      }
    });
  }, []);

  useEffect(() => {
    if (!Boolean(account?.selfId?.id) || !setup.waku) return;

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

    window.waku.addObservers([wakuPropsFollow, wakuPropsShare]);
  }, [account.authenticated, setup.waku]);

  return <>{children}</>;
};

export default Subscribe;
