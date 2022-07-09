import { Notice } from "@prisma/client";
import { useContext, useEffect, useState, useReducer } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ProfileContext } from "../../context/ProfileContext";
import { FlexRow } from "../../components/Flex";
import { Button, Typography, Divider, Box, ButtonBase } from "@mui/material";
import InfiniteScroll from "react-infinite-scroll-component";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useRouter } from "next/router";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { format } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";

type IndexNoticessDirection = "new" | "old";

const IndexNotices = () => {
  const { account, dispatchAccount } = useContext(AuthContext);
  const { profile, dispatchProfile } = useContext(ProfileContext);
  const [hasMore, setHasMore] = useState(true);
  const [upperNextId, setUpperNextId] = useState(null);
  const [lowerNextId, setLowerNextId] = useState(null);
  const [direction, setDirection] = useState<IndexNoticessDirection>("old");
  const [latestId, setLatestId] = useState(null);
  const router = useRouter();

  const reducer = (state: Array<Notice>, action) => {
    const stateIds = state.map((item) => item.id);
    switch (action?.type) {
      case "addOld":
        return [
          ...state,
          ...action.payload.filter((item) => !stateIds.includes(item.id)),
        ];
      case "addNew":
        return [
          ...action.payload.filter((item) => !stateIds.includes(item.id)),
          ...state,
        ];
      case "remove":
        return [...state.filter((msg) => msg !== action.payload)];
      case "reset":
        return [];
      default:
        return state;
    }
  };
  const [indexNotices, dispatchIndexNotices] = useReducer(reducer, []);

  const getIndexNotices = async () => {
    if (!Boolean(account?.selfId?.id)) return;
    const takeNotices = 10;
    let cursorId =
      direction === "new" ? upperNextId ?? indexNotices[0].id : lowerNextId;
    console.log(cursorId);
    const { notices, nextId } = await window.electron.indexNotice({
      did: account.selfId.id,
      cursorId: cursorId,
      take: takeNotices,
      direction: direction,
    });
    if (!notices) {
      setDirection("old");
      return;
    }
    if ((notices?.length ?? 0) < takeNotices && direction === "old")
      setHasMore(false);
    if (direction === "new") {
      setUpperNextId(nextId);
      dispatchIndexNotices({ type: "addNew", payload: notices.reverse() });
    }
    if (direction === "old") {
      setLowerNextId(nextId);
      dispatchIndexNotices({ type: "addOld", payload: notices });
    }
    setDirection("old");
  };

  useEffect(() => {
    getIndexNotices();
    window.electron.addedNotice(() => {
      if (Boolean(account?.selfId?.id)) {
        (async () => {
          const resLatestId = await window.electron.getLatestNoticeId(
            account.selfId.id
          );
          setLatestId(resLatestId);
        })();
      }
    });
  }, [profile?.name]);

  useEffect(() => {
    if (direction === "new") getIndexNotices();
  }, [direction]);

  const noticeTest = async () => {
    console.log("add notice test!");
    await window.electron.addNotice({
      id: null,
      read: false,
      did: account?.selfId?.id,
      type: "test",
      content: "test notice by notice page",
      url: null,
      createdAt: String(new Date().getTime()),
    });
    console.log("added notice!");
  };

  return (
    <>
      <FlexRow justifyContent="start">
        <Typography variant="h4">通知一覧</Typography>
        <Button onClick={noticeTest} sx={{ marginLeft: 1 }}>
          テスト通知
        </Button>
      </FlexRow>
      {latestId - (indexNotices[0]?.id ?? 0) > 0 && (
        <FlexRow marginBottom="0px" marginTop="0px">
          <Button variant="text" onClick={() => setDirection("new")}>
            <MoreVertIcon />
            <Typography variant="subtitle2">
              新しい通知を読み込む（{latestId - indexNotices[0].id}件）
            </Typography>
          </Button>
        </FlexRow>
      )}
      <FlexRow marginTop="20px">
        <div style={{ width: "90%" }}>
          <Divider />
          <InfiniteScroll
            dataLength={indexNotices.length}
            next={() => getIndexNotices()}
            loader={<FlexRow>読み込み中...</FlexRow>}
            endMessage={<FlexRow>読み込み終了</FlexRow>}
            hasMore={hasMore}
            style={{
              overflowX: "hidden",
            }}
            scrollableTarget="mainContent"
            scrollThreshold={0.95}
            inverse={direction === "new"}
          >
            {indexNotices.map((notice) => (
              <div key={notice.id}>
                <FlexRow
                  justifyContent="start"
                  marginTop="0px"
                  marginBottom="0px"
                >
                  <NotificationsIcon
                    sx={{
                      marginLeft: "15px",
                      marginRight: "15px",
                    }}
                  />
                  <Button
                    disabled={!Boolean(notice.url)}
                    onClick={() => router.push(notice.url)}
                    sx={{
                      display: "block",
                      width: "90%",
                      textTransform: "none",
                      "&.Mui-disabled": {
                        color: (theme) => theme.palette.text.primary,
                      },
                    }}
                  >
                    <FlexRow justifyContent="start">
                      <Typography
                        variant="body2"
                        sx={{ color: (theme) => theme.palette.secondary.main }}
                      >
                        {Boolean(notice.createdAt) &&
                          format(
                            utcToZonedTime(
                              Number(notice.createdAt),
                              "Asia/Tokyo"
                            ),
                            "yyyy-MM-dd HH:mm:ss"
                          )}
                      </Typography>
                    </FlexRow>
                    <FlexRow justifyContent="start">
                      <Typography variant="body1">{notice.content}</Typography>
                    </FlexRow>
                  </Button>
                </FlexRow>
                <Divider />
              </div>
            ))}
          </InfiniteScroll>
        </div>
      </FlexRow>
    </>
  );
};

export default IndexNotices;
