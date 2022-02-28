import type { SvgIconTypeMap } from "@mui/material";
import type { OverridableComponent } from "@mui/material/OverridableComponent";

export interface IMenuItem {
  name: string;
  Icon: OverridableComponent<SvgIconTypeMap>;
  route: string;
}

export type ImageMetadata = {
  src: string;
  mimeType: string;
  width: number;
  height: number;
  size?: number;
};

export type ImageSources = {
  original: ImageMetadata;
  alternatives?: Array<ImageMetadata>;
};

export type BasicProfile = {
  name?: string;
  image?: ImageSources;
  description?: string;
  emoji?: string;
  background?: ImageSources;
  birthDate?: string;
  url?: string;
  gender?: string;
  homeLocation?: string;
  residenceCountry?: string;
  nationalities?: Array<string>;
  affiliations?: Array<string>;
};
