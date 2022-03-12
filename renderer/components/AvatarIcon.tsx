import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { Box, Avatar } from "@mui/material";

interface AvatarIconProps {
  src: string;
}

const AvatarIcon = ({ src }: AvatarIconProps): JSX.Element => {
  const avatarIconStyle = {
    width: 45,
    height: 45,
    marginRight: "10px",
    marginTop: "3px",
    marginBottom: "3px",
  };

  return (
    <Box>
      {Boolean(src) ? (
        <Avatar src={src} alt="avatar" sx={avatarIconStyle} />
      ) : (
        <AccountCircleIcon
          sx={{
            ...avatarIconStyle,
            color: (theme) => theme.palette.primary.light,
          }}
        />
      )}
    </Box>
  );
};

export { AvatarIcon };
