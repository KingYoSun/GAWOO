import AccountBoxIcon from '@material-ui/icons/AccountBox';
import AppsIcon from '@material-ui/icons/Apps';
import DevicesIcon from '@material-ui/icons/Devices';

import { IMenuItem } from '../types/general';
import * as ROUTES from './routes';

export const MENU_LIST_ITEMS: IMenuItem[] = [
  {
    name: 'Home',
    Icon: AppsIcon,
    route: ROUTES.HOME,
  },
  {
    name: 'DEVICES',
    Icon: DevicesIcon,
    route: ROUTES.DEVICES,
  },
  {
    name: 'PROFILE',
    Icon: AccountBoxIcon,
    route: ROUTES.PROFILE,
  },
];