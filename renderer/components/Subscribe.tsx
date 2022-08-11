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
    console.log("follow articles!: ", articles.length);

    if (articles.length > 0) {
      let followArticles = await Promise.all(
        articles.map(async (article) => {
          const decodedJWS = await account.selfId.did.verifyJWS(article);
          const authorDid = decodedJWS.kid.replace(/\?version(.*)/, "");

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

  const decodeShareJWSArticles = async (articles) => {
    console.log("share articles!: ", articles.length);

    if (articles.length > 0) {
      let shareArticles = await Promise.all(
        articles.map(async (article) => {
          const decodedJWS = await account.selfId.did.verifyJWS(article);
          const authorDid = decodedJWS.kid.replace(/\?version(.*)/, "");

          if (
            !Boolean(decodedJWS.payload.authorDid) ||
            ![
              decodedJWS.payload.authorDid,
              decodedJWS.payload.reposterDid,
            ].includes(authorDid)
          ) {
            console.log("Verify failed!: ", decodedJWS.kid);
            return false;
          }
          console.log("Verified!: ", decodedJWS.payload);
          return {
            id: null,
            ...decodedJWS.payload,
          };
        })
      );

      shareArticles = shareArticles.filter(Boolean);
      console.log("shareArticles!: ", shareArticles);
      if (shareArticles.length > 0)
        await window.waku.addPostsFromWaku(shareArticles);
    }
  };

  useEffect(() => {
    window.waku.followMessage((payload) => {
      decodeFollowJWSArticles([payload]);
    });
    window.waku.shareMessage((payload) => {
      decodeShareJWSArticles([payload]);
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

    window.waku.addObservers([wakuPropsFollow]);
    window.waku.addFollowingShareObservers(account?.selfId?.id as string);

    (async () => {
      const retriveResFollows = await window.waku.retriveFollowInstanceMessages(
        [wakuPropsFollow]
      );
      if (!retriveResFollows.error) {
        await decodeFollowJWSArticles(retriveResFollows.articles);
      }

      const followStartTime = localStorage.getItem(
        `lastShareGet-${account?.selfId?.id}`
      );
      const retriveResShares = await window.waku.retriveShareInstanceMessages({
        selfId: account?.selfId?.id,
        startTime: followStartTime,
      });
      if (!retriveResShares.error) {
        await decodeShareJWSArticles(retriveResShares.articles);
      }

      localStorage.setItem(
        `lastShareGet-${account?.selfId?.id}`,
        String(new Date().getTime())
      );
      console.log(
        "lastShareGet: ",
        new Date(
          parseInt(localStorage.getItem(`lastFollowGet-${account?.selfId?.id}`))
        )
      );
    })();
  }, [account.authenticated, setup.waku]);

  return <>{children}</>;
};

export default Subscribe;
