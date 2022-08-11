import { ReactNode, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { SignedJWS, WakuClientProps } from "../types/general";
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

  const decodeFollowJWSArticles = async (articles) => {
    console.log("follow articles!: ", articles);

    if (articles.length > 0) {
      let followArticles = await Promise.all(
        articles.map(async (article) => {
          const decodedJWS = await account.selfId.did.verifyJWS(article);
          const authorDid = decodedJWS.kid.replace(/\?version(.*)/, "");

          console.log("decodedJWS!: ", decodedJWS.payload);
          if (
            !Boolean(decodedJWS.payload.followerDid) ||
            authorDid !== decodedJWS.payload.followerDid
          ) {
            console.log("Verify failed!: ", decodedJWS.kid);
            return false;
          }

          console.log("Verified!: ", decodedJWS.payload);
          return decodedJWS.payload;
        })
      );

      console.log("followArticles!: ", followArticles);
      followArticles = followArticles.filter(Boolean);
      console.log("followArticles!: ", followArticles);
      if (followArticles.length > 0)
        await window.waku.editFollowsFromWaku(followArticles);
    }

    localStorage.setItem(
      `lastFollowGet-${account?.selfId?.id}`,
      String(new Date().getTime())
    );
    const followStartTime = localStorage.getItem(
      `lastFollowGet-${account?.selfId?.id}`
    );
    console.log("lastFollowGetTime is: ", new Date(parseInt(followStartTime)));
  };

  useEffect(() => {
    window.waku.followMessage((payload) => {
      decodeFollowJWSArticles([payload]);
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

    const wakuIsConnected = window.waku.isConnected();
    if (!wakuIsConnected) {
      alert("Wakuが起動していません");
      console.log("waku is not running");
      return;
    }

    console.log("add waku Observers!");
    const followStartTime = localStorage.getItem(
      `lastFollowGet-${account?.selfId?.id}`
    );

    const wakuPropsFollow: WakuClientProps = {
      selfId: account?.selfId?.id,
      purpose: "follow",
      startTime: followStartTime,
    };
    const wakuPropsShare: WakuClientProps = {
      selfId: account?.selfId?.id,
      purpose: "share",
    };

    window.waku.addObservers([wakuPropsFollow, wakuPropsShare]);

    (async () => {
      const retriveRes = await window.waku.retriveInstanceMessages([
        wakuPropsFollow,
      ]);
      if (!retriveRes.error) {
        await decodeFollowJWSArticles(retriveRes.articles);
      }
    })();
  }, [account.authenticated, setup.waku]);

  return <>{children}</>;
};

export default Subscribe;
