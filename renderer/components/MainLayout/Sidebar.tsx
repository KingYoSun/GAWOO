import {
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
} from '@mui/material';
import {styled} from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Image from 'next/image';
import Link from 'next/link';
import {useRouter} from 'next/router';
import {useState} from 'react';

import {MENU_LIST_ITEMS} from '../../constants/menu-items';
import {drawerWidth} from '../../styles/theme';

const SideBarLink = styled('a')({
  textDecoration: 'none',
});

interface SideBarProps {
  open: boolean;
  handleDrawerClose: () => void;
}

const Sidebar = ({open, handleDrawerClose}: SideBarProps): JSX.Element => {
  const router = useRouter();
  const initialSelection = MENU_LIST_ITEMS.findIndex(
      (el) => el.route === router.pathname,
  );
  const [selectedIndex, setSelectedIndex] = useState(
    initialSelection !== -1 ? initialSelection : 0,
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        root: (theme) => ({
          [theme.breakpoints.up('sm')]: {
            width: open ? 'auto' : theme.spacing(9),
          },
        }),
        paper: {
          position: 'static',
        },
        position: 'relative',
        whiteSpace: 'nowrap',
        backgroundColor: (theme) => theme.palette.primary.dark,
        width: open ? drawerWidth : '0px',
        transition: (theme) => (open ?
          theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }) :
          theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          })
        ),
        overflowX: open ? 'visible' : 'hidden',
      }}
    >
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Box sx={{marginLeft: (theme) => theme.spacing(1)}}>
          <Image src="/logo.png" alt="logo" width={50} height={25} />
        </Box>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 8px',
        }}>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon sx={{color: (theme) => theme.palette.primary.light}} />
          </IconButton>
        </Box>
      </Box>
      <Divider />
      <List sx={{padding: 0}}>
        {MENU_LIST_ITEMS.map(({route, Icon, name}, id) => (
          <Link href={route} key={id}>
            <SideBarLink>
              <ListItem
                button
                selected={id === selectedIndex}
                onClick={() => setSelectedIndex(id)}
                sx={{backgroundColor: '#8C94AC'}}
              >
                <ListItemIcon
                  sx={{
                    color: (theme) => id === selectedIndex ? theme.palette.primary.contrastText : theme.palette.primary.light,
                  }}
                >
                  <Icon />
                </ListItemIcon>
                <ListItemText
                  primary={name}
                  primaryTypographyProps={{variant: 'subtitle1'}}
                  sx={{
                    color: (theme) => id === selectedIndex ? theme.palette.primary.contrastText : theme.palette.primary.light,
                    primary: (theme) => ({...theme.typography.h6}),
                  }}
                />
              </ListItem>
            </SideBarLink>
          </Link>
        ))}
      </List>
      <Divider />
    </Drawer>
  );
};

export default Sidebar;
