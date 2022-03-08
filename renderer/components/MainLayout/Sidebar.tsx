import {
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Avatar,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useContext } from "react";

import { MENU_LIST_ITEMS } from "../../constants/menu-items";
import { drawerWidth } from "../../styles/theme";

import { ProfileContext } from "../../context/ProfileContext";
import ThemeToggler from "../../components/ThemeToggler";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

interface SideBarProps {
  open: boolean;
  handleDrawerToggle: () => void;
}

const Sidebar = ({ open, handleDrawerToggle }: SideBarProps): JSX.Element => {
  const { profile, dispatchProfile } = useContext(ProfileContext);

  const router = useRouter();
  const initialSelection = MENU_LIST_ITEMS.findIndex(
    (el) => el.route === router.pathname
  );
  const [selectedIndex, setSelectedIndex] = useState(
    initialSelection !== -1 ? initialSelection : 0
  );

  const openMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  });

  const closeMixin = (theme) => ({
    width: `calc(${theme.spacing(7)} + 1px)`,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  });

  const avatarIconStyle = {
    width: 45,
    height: 45,
    marginRight: "10px",
    marginTop: "3px",
    marginBottom: "3px",
  };

  return (
    <Drawer
      variant="permanent"
      sx={(theme) => ({
        position: "relative",
        whiteSpace: "nowrap",
        overflowX: "hidden",
        ...(open && {
          ...openMixin(theme),
        }),
        ...(!open && {
          ...closeMixin(theme),
        }),
      })}
      PaperProps={{
        sx: {
          overflowY: "unset",
          position: "static",
          backgroundColor: (theme) => theme.palette.primary.main,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          marginLeft: (theme) => theme.spacing(1),
        }}
      >
        <IconButton
          sx={{ color: (theme) => theme.palette.primary.contrastText }}
          onClick={handleDrawerToggle}
        >
          {!open ? (
            <MenuIcon />
          ) : (
            <ChevronLeftIcon
              sx={{ color: (theme) => theme.palette.primary.light }}
            />
          )}
        </IconButton>
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            marginTop: "5px",
            marginBottom: "5px",
            marginLeft: "6px",
          }}
        >
          {Boolean(profile.avatar) ? (
            <Avatar src={profile.avatar} alt="avatar" sx={avatarIconStyle} />
          ) : (
            <AccountCircleIcon
              sx={{
                ...avatarIconStyle,
                color: (theme) => theme.palette.primary.light,
              }}
            />
          )}
          <Typography
            variant="h6"
            component="span"
            sx={{
              margin: "0 5px",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              color: (theme) => theme.palette.primary.contrastText,
            }}
          >
            {profile.name}
          </Typography>
        </Box>
      </Box>
      <Divider />
      <List sx={{ padding: 0 }}>
        {MENU_LIST_ITEMS.map(({ route, Icon, name }, id) => (
          // eslint-disable-next-line @next/next/link-passhref
          <Link href={route} key={id}>
            <ListItem
              button
              selected={id === selectedIndex}
              onClick={() => setSelectedIndex(id)}
              sx={{
                backgroundColor: (theme) => theme.palette.primary.main,
                "&.Mui-selected": {
                  backgroundColor: (theme) => theme.palette.primary.light,
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: (theme) =>
                    id === selectedIndex
                      ? theme.palette.primary.contrastText
                      : theme.palette.primary.light,
                }}
              >
                <Icon />
              </ListItemIcon>
              <ListItemText
                primary={name}
                primaryTypographyProps={{ variant: "subtitle1" }}
                sx={{
                  color: (theme) =>
                    id === selectedIndex
                      ? theme.palette.primary.contrastText
                      : theme.palette.primary.light,
                  primary: (theme) => ({ ...theme.typography.h6 }),
                }}
              />
            </ListItem>
          </Link>
        ))}
      </List>
      <Divider />
      <Box
        sx={{
          position: "absolute",
          bottom: (theme) => theme.spacing(2),
        }}
      >
        <ThemeToggler />
      </Box>
    </Drawer>
  );
};

export default Sidebar;
