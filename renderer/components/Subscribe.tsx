import { ReactNode, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { WakuClientProps } from "../types/general";
import { SetupContext } from "../context/SetupContext";
import { LoadingContext } from "../context/LoadingContext";
import { ErrorDialogContext } from "../context/ErrorDialogContext";

type Props = {
  children: ReactNode;
};

const Subscribe = ({ children }: Props) => {
  const { account, dispatchAccount } = useContext(AuthContext);
  const { setup, dispatchSetup } = useContext(SetupContext);
  const { loading, dispatchLoading } = useContext(LoadingContext);
  const { errorDialog, dispatchErrorDialog } = useContext(ErrorDialogContext);

  const wakuSetupMsg = "Wakuの接続中...";

  useEffect(() => {
    window.waku.followMessage((payload) => {
      console.log("followed!: ", payload);
    });
    window.waku.sharePost((payload) => {
      console.log("shared post!: ", payload);
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

        if (!setupWaku)
          dispatchErrorDialog({
            type: "open",
            payload: "Wakuの接続に失敗しました",
          });

        dispatchSetup({ type: "waku", payload: setupWaku });
        dispatchLoading({ type: "remove", payload: wakuSetupMsg });
      })();
    }
  }, []);

  useEffect(() => {
    if (!Boolean(account?.selfId?.id) || !setup.waku) return;

    const subdid =
      "did:3:kjzl6cwe1jw149pr60svdfawesbz7cib0k12vxwxtz724fyyvde8rx95w2c4mah";
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
    const subPropsFollow: WakuClientProps = {
      selfId: subdid,
      purpose: "follow",
    };
    const subPropsShare: WakuClientProps = {
      selfId: subdid,
      purpose: "share",
    };

    window.waku.addObservers([
      wakuPropsFollow,
      wakuPropsShare,
      subPropsFollow,
      subPropsShare,
    ]);
  }, [account.authenticated, setup.waku]);

  return <>{children}</>;
};

export default Subscribe;
