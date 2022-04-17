import DevicesIcon from "@mui/icons-material/Devices";

import { IMenuItem } from "../types/general";
import * as ROUTES from "./routes";

export const MENU_LIST_ITEMS: IMenuItem[] = [
  {
    name: "DEVICES",
    Icon: DevicesIcon,
    route: ROUTES.DEVICES,
  },
];
