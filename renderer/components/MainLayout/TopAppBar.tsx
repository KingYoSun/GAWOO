import {
  AppBar,
  IconButton,
  Toolbar,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

import {drawerWidth} from '../../styles/theme';
import ThemeToggler from '../../components/ThemeToggler';

interface TopAppBarProps {
  open: boolean;
  handleDrawerOpen: () => void;
}

const TopAppBar = ({open, handleDrawerOpen}: TopAppBarProps): JSX.Element => {
  return (
    <AppBar
      position="absolute"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        marginLeft: open ? drawerWidth : null,
        width: open ? `calc(100% - ${drawerWidth}px)` : null,
        transition: (theme) => (open ?
          theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }):
          theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          })
        ),
      }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerOpen}
          sx={{
            marginRight: 4,
            display: open ? 'none' : null,
          }}
        >
          <MenuIcon />
        </IconButton>
        <Typography
          component="h1"
          variant="h6"
          color="inherit"
          noWrap
          sx={{flexGrow: 1, margin: '0 auto'}}
          align="center"
        >
          GAWOO
        </Typography>
        <ThemeToggler />
      </Toolbar>
    </AppBar>
  );
};

export default TopAppBar;
