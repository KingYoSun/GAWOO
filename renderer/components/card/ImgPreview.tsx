import { Card, CardMedia, CardActionArea, Box } from "@mui/material";

type InputImgPreviewProps = {
  src: string;
  onClick: () => void;
  onLoad: () => void;
};

const ImgPreview = (props: InputImgPreviewProps) => {
  return (
    <Box sx={{ marginRight: "5px", marginTop: "5px" }}>
      {Boolean(props.src) && (
        <Card
          sx={{
            maxWidth: "120px",
            maxHeight: "250px",
            zIndex: 3,
          }}
        >
          <CardActionArea onClick={() => props.onClick()}>
            <CardMedia
              component="img"
              image={props.src}
              alt="image button"
              onLoad={() => props.onLoad()}
            />
          </CardActionArea>
        </Card>
      )}
    </Box>
  );
};

export default ImgPreview;
