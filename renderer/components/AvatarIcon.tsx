import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { Avatar, Box, IconButton, StyledComponentProps } from "@mui/material";
import { useRouter } from "next/router";

interface AvatarIconProps {
  src: string | null;
  did?: string;
  marginTop?: string | number;
  marginRight?: string | number;
  marginBottom?: string | number;
  size?: number;
}

const AvatarIcon = ({
  src,
  did,
  marginTop,
  marginRight,
  marginBottom,
  size = 45,
}: AvatarIconProps): JSX.Element => {
  const router = useRouter();
  const avatarIconStyle = {
    zIndex: 3,
    width: size,
    height: size,
    marginRight: marginRight ?? "15px",
    marginTop: marginTop ?? "3px",
    marginBottom: marginBottom ?? "3px",
  };

  return (
    <>
      {!Boolean(did) && (
        <Box sx={avatarIconStyle}>
          {Boolean(src) ? (
            <Avatar src={src} alt="avatar" sx={{ width: size, height: size }} />
          ) : (
            <AccountCircleIcon
              sx={{
                color: (theme) => theme.palette.primary.light,
                width: size,
                height: size,
              }}
            />
          )}
        </Box>
      )}
      {Boolean(did) && (
        <IconButton
          onClick={() => router.push(`/users/${did}`)}
          disabled={!Boolean(did)}
          sx={avatarIconStyle}
        >
          {Boolean(src) ? (
            <Avatar src={src} alt="avatar" sx={{ width: size, height: size }} />
          ) : (
            <AccountCircleIcon
              sx={{
                color: (theme) => theme.palette.primary.light,
                width: size,
                height: size,
              }}
            />
          )}
        </IconButton>
      )}
    </>
  );
};

export { AvatarIcon };
