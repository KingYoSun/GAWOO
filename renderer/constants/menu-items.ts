import AppsIcon from "@mui/icons-material/Apps";
import DevicesIcon from "@mui/icons-material/Devices";

import { IMenuItem } from "../types/general";
import * as ROUTES from "./routes";

export const MENU_LIST_ITEMS: IMenuItem[] = [
  {
    name: "Home",
    Icon: AppsIcon,
    route: ROUTES.HOME,
  },
  {
    name: "DEVICES",
    Icon: DevicesIcon,
    route: ROUTES.DEVICES,
  },
];
