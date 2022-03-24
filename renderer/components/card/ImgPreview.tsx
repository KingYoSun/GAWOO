import { Card, CardMedia, CardActionArea } from "@mui/material";

type InputImgPreviewProps = {
  src: string;
  onClick: () => void;
};

const ImgPreview = (props: InputImgPreviewProps) => {
  return (
    <>
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
    </>
  );
};

export default ImgPreview;
