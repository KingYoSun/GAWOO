import { Box, IconButton } from "@mui/material";
import { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";

type InputImgPreviewProps = {
  file: File;
  onClose: () => void;
  disabled: boolean;
};

const ImgPreview = (props: InputImgPreviewProps) => {
  const [dataUrl, setDataUrl] = useState(null);

  useEffect(() => {
    const reader = new FileReader();
    reader.addEventListener(
      "load",
      () => {
        setDataUrl(reader.result);
      },
      false
    );

    if (Boolean(props.file)) reader.readAsDataURL(props.file);
  }, []);

  return (
    <Box
      sx={{
        position: "relative",
      }}
    >
      {Boolean(dataUrl) && (
        <Box>
          <IconButton
            disabled={props.disabled}
            sx={{
              color: (theme) => theme.palette.primary.contrastText,
              position: "absolute",
              top: "0px",
              left: "5px",
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
          <img
            alt="post image preview"
            src={dataUrl}
            style={{
              width: "120px",
              height: "120px",
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default ImgPreview;
