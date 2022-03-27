import { Box, IconButton } from "@mui/material";
import { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";

type InputVideoPreviewProps = {
  file: File;
  onClose: () => void;
  disabled: boolean;
};

const VideoPreview = (props: InputVideoPreviewProps) => {
  const [dataUrl, setDataUrl] = useState(null);

  useEffect(() => {
    if (Boolean(props.file) && props.file instanceof File) {
      const reader = new FileReader();
      reader.addEventListener(
        "load",
        () => {
          setDataUrl(reader.result);
        },
        false
      );
      reader.readAsDataURL(props.file);
    }
    if (Boolean(props.file) && typeof props.file === "string") {
      setDataUrl(`fileabsolute:///${props.file}`);
    }
  }, []);

  return (
    <Box sx={{ position: "relative", marginRight: "5px" }}>
      {Boolean(dataUrl) && (
        <Box>
          <IconButton
            disabled={props.disabled}
            sx={{
              color: (theme) => theme.palette.primary.contrastText,
              position: "absolute",
              top: "5px",
              left: "5px",
              zIndex: 2,
              backgroundColor: (theme) => theme.palette.primary.dark,
              opacity: 0.8,
              "&:hover": {
                backgroundColor: (theme) => theme.palette.primary.dark,
                opacity: 0.5,
              },
            }}
            onClick={props.onClose}
          >
            <CloseIcon />
          </IconButton>
          <video
            src={dataUrl}
            controls
            style={{
              maxWidth: "500px",
              maxHeight: "500px",
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default VideoPreview;
