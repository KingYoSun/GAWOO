import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { Box, Avatar } from "@mui/material";

interface AvatarIconProps {
  src: string;
  marginTop?: string | number;
  marginRight?: string | number;
  marginBottom?: string | number;
}

const AvatarIcon = ({
  src,
  marginTop,
  marginRight,
  marginBottom,
}: AvatarIconProps): JSX.Element => {
  const avatarIconStyle = {
    width: 45,
    height: 45,
    marginRight: marginRight ?? "15px",
    marginTop: marginTop ?? "3px",
    marginBottom: marginBottom ?? "3px",
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
