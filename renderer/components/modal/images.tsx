import { Box, Dialog, Slide, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

export interface ImagesDialogProps {
  images: Array<string>;
  length: number;
  open: boolean;
  onClose: () => void;
  maxWidth?: number | string;
  maxHeight?: number | string;
}

const ImagesDialog = (props: ImagesDialogProps, ref) => {
  const MAX_IMAGES_COUNT = props.length;
  const maxWidth = props.maxWidth ?? "900px";
  const maxHeight = props.maxHeight ?? "900px";
  const [index, setIndex] = useState(0);
  const [slideIn, setSlideIn] = useState(true);
  const [slideDirection, setSlideDirection] = useState<
    "down" | "left" | "right" | "up"
  >("down");

  const onArrowClick = (direction) => {
    const increment = direction === "left" ? -1 : 1;
    const newIndex = (index + increment + MAX_IMAGES_COUNT) % MAX_IMAGES_COUNT;
    const newDirection = direction === "left" ? "right" : "left";
    setSlideDirection(direction);
    setSlideIn(false);

    setTimeout(() => {
      setIndex(newIndex);
      setSlideDirection(newDirection);
      setSlideIn(true);
    }, 500);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.keyCode === 39) {
        onArrowClick("right");
      }
      if (e.keyCode === 37) {
        onArrowClick("left");
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  const handleClose = () => {
    setSlideDirection("down");
    props.onClose();
  };

  useImperativeHandle(ref, () => ({
    setIndexFromParent(val: number) {
      setIndex(val);
    },
  }));

  return (
    <Dialog
      onClose={handleClose}
      open={props.open}
      PaperProps={{
        sx: {
          backgroundColor: "transparent",
          maxWidth: maxWidth,
          maxHeight: maxHeight,
          boxShadow: "none",
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          overflow: (slideIn) => (slideIn ? "hidden" : "visible"),
          maxWidth: maxWidth,
          maxHeight: maxHeight,
        }}
      >
        <IconButton
          sx={{
            color: (theme) => theme.palette.primary.contrastText,
            position: "absolute",
            top: "5px",
            left: "5px",
            zIndex: 2,
            backgroundColor: (theme) => theme.palette.primary.dark,
            opacity: 0.5,
            "&:hover": {
              backgroundColor: (theme) => theme.palette.primary.dark,
              opacity: 0.3,
            },
          }}
          onClick={handleClose}
        >
          <CloseIcon />
        </IconButton>
        <IconButton
          sx={{
            color: (theme) => theme.palette.primary.contrastText,
            position: "absolute",
            top: "50%",
            left: "5px",
            zIndex: 2,
            backgroundColor: (theme) => theme.palette.primary.dark,
            opacity: 0.5,
            "&:hover": {
              backgroundColor: (theme) => theme.palette.primary.dark,
              opacity: 0.3,
            },
          }}
          onClick={() => onArrowClick("left")}
        >
          <ChevronLeftIcon />
        </IconButton>
        <IconButton
          sx={{
            color: (theme) => theme.palette.primary.contrastText,
            position: "absolute",
            top: "50%",
            right: "5px",
            zIndex: 2,
            backgroundColor: (theme) => theme.palette.primary.dark,
            opacity: 0.5,
            "&:hover": {
              backgroundColor: (theme) => theme.palette.primary.dark,
              opacity: 0.3,
            },
          }}
          onClick={() => onArrowClick("left")}
        >
          <ChevronRightIcon />
        </IconButton>
        <Slide in={slideIn} direction={slideDirection}>
          <img
            alt="images preview"
            src={props.images[index]}
            style={{
              maxWidth: maxWidth,
              maxHeight: maxHeight,
            }}
          />
        </Slide>
      </Box>
    </Dialog>
  );
};

export default forwardRef(ImagesDialog);
