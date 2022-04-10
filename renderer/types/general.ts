import type { SvgIconTypeMap } from "@mui/material";
import type { OverridableComponent } from "@mui/material/OverridableComponent";
import { Post } from "@prisma/client";

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
  avatar?: string;
  image?: ImageSources | number;
  description?: string;
  emoji?: string;
  bgImg?: string;
  background?: ImageSources;
  birthDate?: string | Date | null;
  url?: string;
  gender?: string;
  homeLocation?: string;
  residenceCountry?: string;
  nationalities?: Array<string>;
  affiliations?: Array<string>;
};

export type WakuClientProps = {
  selfId: string;
  purpose: "follow" | "share";
  post?: Post;
};

export type TFile = {
  path: string | null;
  url: string | null;
  name: string;
  type: string;
};

export type IpfsFile = {
  cid: string;
  name: string;
};

export type IpfsPost = {
  succeeded: Array<string>;
  failure: string;
};

export interface IIndexPosts {
  did?: string;
  take?: number;
  cursorId?: number;
  direction: "new" | "old";
}

export interface IPostPage {
  cid: string;
  take: number;
  cursorId?: number;
}
