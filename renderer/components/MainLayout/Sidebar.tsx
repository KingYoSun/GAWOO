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
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useContext } from "react";

import { MENU_LIST_ITEMS } from "../../constants/menu-items";
import { drawerWidth } from "../../styles/theme";

import { ProfileContext } from "../../context/ProfileContext";

interface SideBarProps {
  open: boolean;
  handleDrawerClose: () => void;
}

const Sidebar = ({ open, handleDrawerClose }: SideBarProps): JSX.Element => {
  const { profile, dispatchProfile } = useContext(ProfileContext);

  const router = useRouter();
  const initialSelection = MENU_LIST_ITEMS.findIndex(
    (el) => el.route === router.pathname
  );
  const [selectedIndex, setSelectedIndex] = useState(
    initialSelection !== -1 ? initialSelection : 0
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        position: "relative",
        whiteSpace: "nowrap",
        width: open ? drawerWidth : "0px",
        transition: (theme) =>
          open
            ? theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              })
            : theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
        overflowX: open ? "visible" : "hidden",
      }}
      PaperProps={{
        sx: {
          position: "static",
          backgroundColor: (theme) => theme.palette.primary.main,
        },
      }}
    >
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
            marginLeft: (theme) => theme.spacing(1),
          }}
        >
          <Image src="/images/logo.png" alt="logo" width={50} height={50} />
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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            padding: "0 8px",
          }}
        >
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon
              sx={{ color: (theme) => theme.palette.primary.light }}
            />
          </IconButton>
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
    </Drawer>
  );
};

export default Sidebar;
