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
  Tooltip,
  Menu,
  MenuItem,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useContext, useEffect } from "react";

import { MENU_LIST_ITEMS } from "../../constants/menu-items";
import { drawerWidth } from "../../styles/theme";

import { ProfileContext } from "../../context/ProfileContext";
import { AuthContext } from "../../context/AuthContext";
import ThemeToggler from "../../components/ThemeToggler";
import MenuIcon from "@mui/icons-material/Menu";
import { AvatarIcon } from "../../components/AvatarIcon";
import * as ErrorMsg from "../../utils/error-msg";
import { LoadingContext } from "../../context/LoadingContext";

interface SideBarProps {
  open: boolean;
  handleDrawerToggle: () => void;
}

const Sidebar = ({ open, handleDrawerToggle }: SideBarProps): JSX.Element => {
  const { profile, dispatchProfile } = useContext(ProfileContext);
  const { account, dispatchAccount } = useContext(AuthContext);
  const { loading, dispatchLoading } = useContext(LoadingContext);
  const [accounts, setAccounts] = useState([]);
  const [avatarMenuAnchor, setAvatarMenuAnchor] = useState(null);
  const avatarOpen = Boolean(avatarMenuAnchor);

  const handleAvatarIconButton = (event) => {
    setAvatarMenuAnchor(event.currentTarget);
  };
  const handleAvatarMenuClose = () => {
    setAvatarMenuAnchor(null);
  };

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
    marginRight: "15px",
    marginTop: "3px",
    marginBottom: "3px",
  };

  useEffect(() => {
    let arrAccount = JSON.parse(localStorage.getItem("accounts"));
    setAccounts(arrAccount ?? []);
  }, []);

  const storeWalletConnect = () => {
    const wcJson = localStorage.getItem("walletconnect");
    if (!Boolean(wcJson) || !Boolean(account?.selfId?.id)) return;
    localStorage.setItem(`walletconnect-${account.selfId.id}`, wcJson);
  };

  const handleChangeAccount = async (item) => {
    const loadingMsg = "アカウント切替中...";
    dispatchLoading({ type: "add", payload: loadingMsg });

    try {
      storeWalletConnect();
      let arrAccount = JSON.parse(localStorage.getItem("accounts"));
      if (!Boolean(arrAccount)) arrAccount = [];
      arrAccount = arrAccount.filter(
        (storedItem) => storedItem.did !== item.did
      );
      arrAccount.push({
        name: profile?.name,
        did: account.selfId.id,
        avatar: profile?.avatar,
      });
      localStorage.setItem("accounts", JSON.stringify(arrAccount));
      setAccounts(arrAccount ?? []);

      const targetWcJson = localStorage.getItem(`walletconnect-${item.did}`);
      if (!Boolean(targetWcJson)) {
        throw "指定されたアカウント接続情報がありません";
      }

      localStorage.setItem("walletconnect", targetWcJson);

      await account.authenticate(false);
    } catch (e) {
      ErrorMsg.call(new Error(e));
    } finally {
      dispatchLoading({ type: "remove", payload: loadingMsg });
      location.reload();
    }
  };

  const handleAddAccount = async () => {
    storeWalletConnect();

    let arrAccount = JSON.parse(localStorage.getItem("accounts"));
    if (!Boolean(arrAccount)) arrAccount = [];
    arrAccount.push({
      name: profile?.name,
      did: account.selfId.id,
      avatar: profile?.avatar,
    });
    localStorage.setItem("accounts", JSON.stringify(arrAccount));
    setAccounts(arrAccount ?? []);

    await account.authenticate(true);
    location.reload();
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
          }}
        >
          <Tooltip title="アカウント切り替え">
            <IconButton
              onClick={handleAvatarIconButton}
              aria-controls={open ? "account-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
            >
              <AvatarIcon src={profile?.avatar} />
            </IconButton>
          </Tooltip>
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
            {profile?.name}
          </Typography>
        </Box>
        <Menu
          anchorEl={avatarMenuAnchor}
          id="account-menu"
          open={avatarOpen}
          onClose={handleAvatarMenuClose}
          onClick={handleAvatarMenuClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: "visible",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
              mt: 1.5,
              "&:before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          {accounts.map((item) => (
            <MenuItem key={item.did} onClick={(e) => handleChangeAccount(item)}>
              <AvatarIcon src={item.avatar} />
              <Typography
                variant="h6"
                component="span"
                sx={{
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  color: (theme) => theme.palette.primary.main,
                }}
              >
                {item.name}
              </Typography>
            </MenuItem>
          ))}
          <MenuItem>
            <IconButton onClick={handleAddAccount}>
              <AddCircleOutlineIcon
                sx={{
                  color: (theme) => theme.palette.primary.light,
                }}
              />
            </IconButton>
          </MenuItem>
        </Menu>
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
