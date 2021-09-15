import type { SvgIconTypeMap } from '@material-ui/core';
import type { OverridableComponent } from '@material-ui/core/OverridableComponent';

export interface IMenuItem {
  name: string;
  Icon: OverridableComponent<SvgIconTypeMap>;
  route: string;
}