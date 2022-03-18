import { ReactNode, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { WakuClientProps } from "../types/general";
import { SetupContext } from "../context/SetupContext";
import { LoadingContext } from "../context/LoadingContext";
import * as ErrorMsg from "../utils/error-msg";

type Props = {
  children: ReactNode;
};

const Subscribe = ({ children }: Props) => {
  const { account, dispatchAccount } = useContext(AuthContext);
  const { setup, dispatchSetup } = useContext(SetupContext);
  const { loading, dispatchLoading } = useContext(LoadingContext);

  const wakuSetupMsg = "Wakuの接続中...";

  useEffect(() => {
    window.waku.followMessage((msg: string) => {
      console.log("followed!: ", msg);
    });
    window.waku.sharePost((msg: string) => {
      console.log("shared post!: ", msg);
    });

    const flag = window.waku.isConnected();
    dispatchSetup({ type: "waku", payload: flag });

    if (setup.waku) dispatchLoading({ type: "remove", payload: wakuSetupMsg });
    if (!setup.waku) {
      dispatchLoading({ type: "add", payload: wakuSetupMsg });
      (async () => {
        let setupWaku = false;
        let retry = 0;

        while (!setupWaku && retry < 4) {
          setupWaku = await window.waku.init();
          if (!setupWaku) retry++;
          if (setupWaku) break;
        }

        if (!setupWaku) ErrorMsg.call(new Error("Wakuの接続に失敗しました"));

        dispatchSetup({ type: "waku", payload: setupWaku });
        dispatchLoading({ type: "remove", payload: wakuSetupMsg });
      })();
    }
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
