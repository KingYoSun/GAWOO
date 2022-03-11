import { CircularProgress, Modal, Box, Typography } from "@mui/material";
import { ReactNode, useContext, useEffect } from "react";

import { LoadingContext } from "../context/LoadingContext";
import { SetupContext } from "../context/SetupContext";

type Props = {
  children: ReactNode;
};

const LoadingOverlay = ({ children }: Props) => {
  const { loading, dispatchLoading } = useContext(LoadingContext);
  const { setup, dispatchSetup } = useContext(SetupContext);

  const setupMsg = "IPFSの起動中...";

  useEffect(() => {
    (async () => {
      const res = await window.electron.confirmSetup();
      console.log("setup confirmed!: ", res);
      dispatchSetup({ type: "set", payload: res });
    })();

    window.electron.setup(() => {
      console.log("setup_finished!");
      dispatchSetup({ type: "set", payload: true });
    });
  }, []);

  useEffect(() => {
    if (!setup) dispatchLoading({ type: "add", payload: setupMsg });
    if (setup) dispatchLoading({ type: "remove", payload: setupMsg });
  }, [setup]);

  return (
    <>
      {!!loading && (
        <Modal
          open={Boolean(loading.length > 0)}
          aria-describedby="loading-msgs"
        >
          <Box
            sx={{
              position: "absolute",
              top: "40%",
              left: "47%",
              width: "auto",
              textAlign: "center",
              outline: "none",
            }}
          >
            <CircularProgress />
            <Typography
              id="loading-msgs"
              sx={{
                color: (theme) => theme.palette.primary.contrastText,
              }}
            >
              {loading.map((msg, i) => (
                <span key={`loading-${i}`}>
                  {msg}
                  <br />
                </span>
              ))}
            </Typography>
          </Box>
        </Modal>
      )}
      {children}
    </>
  );
};

export default LoadingOverlay;
