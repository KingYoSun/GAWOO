import { Card, CardMedia, CardActionArea, Box } from "@mui/material";

type InputImgPreviewProps = {
  src: string;
  onClick: () => void;
};

const ImgPreview = (props: InputImgPreviewProps) => {
  return (
    <Box sx={{ marginRight: "5px" }}>
      {Boolean(props.src) && (
        <Card
          sx={{
            maxWidth: "120px",
            maxHeight: "250px",
          }}
        >
          <CardActionArea onClick={() => props.onClick()}>
            <CardMedia component="img" image={props.src} alt="image button" />
          </CardActionArea>
        </Card>
      )}
    </Box>
  );
};

export default ImgPreview;
