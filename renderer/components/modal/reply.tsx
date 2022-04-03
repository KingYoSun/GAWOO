import { Post } from "@prisma/client";
import { Box, Dialog, IconButton, Divider } from "@mui/material";
import InputPost from "../input/Post";
import CloseIcon from "@mui/icons-material/Close";
import { FlexRow } from "../Flex";
import CardPost from "../card/Post";

interface ReplyDialogInterface {
  replyTo: Post;
  topic: Post;
  open: boolean;
  handleClose: () => void;
  handleSubmit: () => Promise<void>;
}

const ReplyDialog = (props: ReplyDialogInterface) => {
  return (
    <Dialog
      open={props.open}
      onClose={() => props.handleClose()}
      PaperProps={{
        sx: {
          minWidth: "700px",
        },
      }}
      sx={{
        borderRadius: "30px",
      }}
    >
      <Box sx={{ position: "relative" }}>
        <IconButton
          sx={{
            color: (theme) => theme.palette.primary.contrastText,
            position: "absolute",
            top: "5px",
            right: "5px",
            zIndex: 3,
            backgroundColor: (theme) => theme.palette.primary.dark,
            opacity: 0.5,
            "&:hover": {
              backgroundColor: (theme) => theme.palette.primary.dark,
              opacity: 0.3,
            },
          }}
          onClick={props.handleClose}
        >
          <CloseIcon />
        </IconButton>
        {Boolean(props.replyTo) && (
          <Box
            sx={{
              backgroundColor: (theme) => theme.palette.background.default,
            }}
          >
            <FlexRow justifyContent="start" marginTop="0px" marginBottom="0px">
              <CardPost
                post={props.replyTo}
                onReply={() => {}}
                showBar={false}
                isReply={true}
              />
            </FlexRow>
            <Divider />
            <InputPost
              topic={props.topic ?? props.replyTo}
              replyTo={props.replyTo}
              doReload={() => props.handleSubmit()}
            />
          </Box>
        )}
      </Box>
    </Dialog>
  );
};

export default ReplyDialog;
