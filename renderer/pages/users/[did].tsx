import { useRouter } from "next/router";
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ProfileContext } from "../../context/ProfileContext";
import { BasicProfile, ImageSources } from "../../types/general";
import IndexPosts from "../../components/IndexPosts";
import { FlexRow } from "../../components/Flex";
import { Box, Button, Typography } from "@mui/material";
import { Core } from "@self.id/core";
import { CERAMIC_NETWORK } from "../../constants/identity";
import { AvatarIcon } from "../../components/AvatarIcon";

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
    if (did === account?.selfId?.id) setUserProfile(profile);
    if (did !== account?.selfId?.id) {
      (async () => {
        console.log("get user profile!");
        const selfIdCore = new Core({ ceramic: CERAMIC_NETWORK });
        const res = (await selfIdCore
          .get("basicProfile", did as string)
          .catch((e) => {
            throw e;
          })) as BasicProfile;

        console.log(`got user profile!\n${JSON.stringify(res)}`);
        setUserProfile(res);
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
    const height = Boolean(refProfileBody?.current?.clientHeight)
      ? `${refProfileBody?.current?.clientHeight + 35}px`
      : "200px";
    setProfileHeight(height);
  }, [refProfileBody]);

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
          minHeight: profileHeight ?? "200px",
          zIndex: 0,
        }}
      >
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
              width: "75%",
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
              </Box>
            </FlexRow>
            <FlexRow justifyContent="start">
              <Typography sx={{ fontSize: "15px", zIndex: 2 }}>
                {userProfile?.description}
              </Typography>
            </FlexRow>
            <FlexRow justifyContent="start">
              <Button
                variant="contained"
                onClick={() => router.push("/profile")}
              >
                <Typography>プロフィール編集</Typography>
              </Button>
            </FlexRow>
          </div>
        )}
      </Box>
      <IndexPosts did={did as string} reloadCount={reloadCount} />
    </Box>
  );
};

export default UserPage;
