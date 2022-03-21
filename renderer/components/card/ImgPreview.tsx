import { Box, IconButton } from "@mui/material";
import { useEffect, useState } from "react";

type InputImgPreviewProps = {
  src: string;
};

const ImgPreview = (props: InputImgPreviewProps) => {
  return (
    <Box>
      {Boolean(props.src) && (
        <img
          alt="post image preview"
          src={props.src}
          style={{
            width: "120px",
            height: "120px",
          }}
        />
      )}
    </Box>
  );
};

export default ImgPreview;
