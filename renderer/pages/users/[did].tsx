import { useRouter } from "next/router";
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ProfileContext } from "../../context/ProfileContext";
import { BasicProfile, ImageSources } from "../../types/general";
import IndexPosts from "../../components/IndexPosts";
import { FlexRow } from "../../components/Flex";
import { Box, Button, Typography } from "@mui/material";
import { AvatarIcon } from "../../components/AvatarIcon";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { ErrorDialogContext } from "../../context/ErrorDialogContext";
import gotOtherUser from "../../utils/gotOtherUser";

const UserPage = () => {
  const router = useRouter();
  const { did } = router.query;
  const { account, dispatchAccount } = useContext(AuthContext);
  const { profile, dispatchProfile } = useContext(ProfileContext);
  const [userProfile, setUserProfile] = useState<BasicProfile>(null);
  const [reloadCount, setReloadCount] = useState(0);
  const [userAvatar, setUserAvatar] = useState(null);
  const [userBgImg, setUserBgImg] = useState(null);
  const refProfileBody = useRef(null);
  const [profileHeight, setProfileHeight] = useState(null);
  const [isMyProfile, setIsMyProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollower, setIsFollower] = useState(false);
  const { errorDialog, dispatchErrorDialog } = useContext(ErrorDialogContext);

  const fetchImage = async (key) => {
    const res = await window.ipfs.catImage(
      userProfile[key].original.src,
      userProfile[key].original.mimeType
    );
    console.log(`fetched ${key}!`);
    return res;
  };

  useEffect(() => {
    if (!account?.isConnected()) return;
    if (did === account?.selfId?.id) {
      setUserProfile(profile);
      setIsMyProfile(true);
    }
    if (did !== account?.selfId?.id) {
      (async () => {
        console.log("get user profile!");
        try {
          const res = await gotOtherUser(did as string);
          console.log(`got user profile!\n${JSON.stringify(res)}`);
          setUserProfile(res);
        } catch (e) {
          dispatchErrorDialog({
            type: "open",
            payload: "ユーザー情報が取得できませんでした",
          });
          router.push("/");
        }

        try {
          console.log("get follow status!");
          const res = await window.electron.getFollowStatus(
            account?.selfId?.id,
            did as string
          );
          if (Boolean(res.error)) throw res.error;

          setIsFollowing(res.isFollow);
          setIsFollower(res.isFollower);
        } catch (e) {
          console.log("failed getting follow status!: ", e);
          dispatchErrorDialog({
            type: "open",
            payload: "フォロー情報が取得できませんでした",
          });
        }
      })();
    }
  }, [account?.isConnected()]);

  useEffect(() => {
    const image: ImageSources = userProfile?.image as ImageSources;
    const backgorund: ImageSources = userProfile?.background as ImageSources;
    if (Boolean(userProfile?.name))
      (async () => {
        await Promise.all([
          (async () => {
            if (Boolean(image?.original.src) && !Boolean(userProfile?.avatar)) {
              const newAvatarImg = await fetchImage("image");
              setUserAvatar(newAvatarImg);
            }
            if (Boolean(userProfile?.avatar)) setUserAvatar(userProfile.avatar);
          })(),
          (async () => {
            if (
              Boolean(backgorund?.original.src) &&
              !Boolean(userProfile?.bgImg)
            ) {
              const newBgImg = await fetchImage("background");
              setUserBgImg(newBgImg);
            }
            if (Boolean(userProfile?.bgImg)) setUserBgImg(userProfile.bgImg);
          })(),
        ]);
      })();
  }, [userProfile]);

  useEffect(() => {
    const height = Boolean(refProfileBody?.current)
      ? `${refProfileBody.current.clientHeight + 35}px`
      : "180px";
    setProfileHeight(height);
  }, [refProfileBody?.current]);

  const handleFollowBtn = async () => {
    if (Boolean(isFollowing)) {
      console.log("unfollow!");
      try {
        const res = await window.electron.deleteFollow({
          did: did as string,
          followerDid: account?.selfId?.id,
          followerName: profile.name,
          unfollow: true,
        });
        if (Boolean(res.error)) throw res.error;

        setIsFollowing(false);
      } catch (e) {
        console.log("failed deleting follow status!: ", e);
        dispatchErrorDialog({
          type: "open",
          payload: "フォロー解除ができませんでした",
        });
      }
    } else {
      console.log("follow!");
      try {
        const res = await window.electron.createFollow({
          did: did as string,
          followerDid: account?.selfId?.id,
          followerName: profile.name,
          unfollow: false,
        });
        if (Boolean(res.error)) throw res.error;

        setIsFollowing(true);
      } catch (e) {
        console.log("failed creating follow status!: ", e);
        dispatchErrorDialog({
          type: "open",
          payload: "フォローできませんでした",
        });
      }
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "start",
          flexWrap: "wrap",
          position: "relative",
          width: "100%",
          minHeight: profileHeight ?? "180px",
          zIndex: 0,
        }}
      >
        {!Boolean(userBgImg) && (
          <Skeleton
            width="100%"
            height="180px"
            duration={1}
            baseColor="#e0e0e0"
            style={{
              position: "absolute",
              top: "0px",
              left: "0px",
              zIndex: 3,
            }}
          />
        )}
        {Boolean(userBgImg) && (
          <div
            style={{
              position: "absolute",
              top: "0px",
              left: "0px",
              width: "100%",
              zIndex: 0,
            }}
          >
            <img
              src={userBgImg}
              alt="background"
              style={{
                width: "100%",
                height: profileHeight ?? "200px",
                objectFit: "cover",
                zIndex: 0,
              }}
            />
          </div>
        )}
        {Boolean(userBgImg) && (
          <div
            style={{
              position: "absolute",
              top: "0px",
              height: "100%",
              left: "0px",
              width: "80%",
              backgroundColor: "#fff",
              opacity: 0.43,
            }}
          />
        )}
        {Boolean(userProfile) && (
          <div
            style={{
              position: "absolute",
              top: "10%",
              left: "11%",
              zIndex: 2,
            }}
            ref={refProfileBody}
          >
            <FlexRow justifyContent="start">
              <AvatarIcon src={userAvatar} size={60} />
              <Box>
                <FlexRow justifyContent="start">
                  <Typography variant="h5" sx={{ zIndex: 2 }}>
                    {userProfile?.name}
                  </Typography>
                </FlexRow>
                <FlexRow justifyContent="start">
                  <Typography
                    sx={{ fontSize: "13px", zIndex: 2, color: "#424242" }}
                  >
                    @{did}
                  </Typography>
                </FlexRow>
                {!Boolean(isMyProfile) && Boolean(isFollower) && (
                  <FlexRow justifyContent="start">
                    <Typography
                      sx={{
                        fontSize: "13px",
                        zIndex: 2,
                        color: "white",
                        backgroundColor: "#2C3333",
                        opacity: 0.75,
                        padding: "1px 2px",
                        borderRadius: "3px",
                      }}
                    >
                      フォローされています
                    </Typography>
                  </FlexRow>
                )}
              </Box>
            </FlexRow>
            <FlexRow justifyContent="start">
              <Typography sx={{ fontSize: "15px", zIndex: 2 }}>
                {userProfile?.description}
              </Typography>
            </FlexRow>
            {Boolean(isMyProfile) && (
              <FlexRow justifyContent="start">
                <Button
                  variant="contained"
                  onClick={() => router.push("/profile")}
                >
                  <Typography>プロフィール編集</Typography>
                </Button>
              </FlexRow>
            )}
            {!Boolean(isMyProfile) && (
              <FlexRow justifyContent="start">
                <Button
                  variant="contained"
                  color={Boolean(isFollowing) ? "success" : "primary"}
                  onClick={handleFollowBtn}
                >
                  <Typography>
                    {Boolean(isFollowing) ? "フォロー解除" : "フォローする"}
                  </Typography>
                </Button>
              </FlexRow>
            )}
          </div>
        )}
      </Box>
      <IndexPosts did={did as string} reloadCount={reloadCount} />
    </Box>
  );
};

export default UserPage;
