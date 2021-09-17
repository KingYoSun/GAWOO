import type { SvgIconTypeMap } from '@material-ui/core';
import type { OverridableComponent } from '@material-ui/core/OverridableComponent';

export interface IMenuItem {
  name: string;
  Icon: OverridableComponent<SvgIconTypeMap>;
  route: string;
}

export interface IArticle {
  id: string;
  title: string;
  published_at: string;
  url: string;
  public_reactions_count: number;
  page_views_count: number;
  comments_count: number;
  cover_image: string;
  tag_list: Array<string>;
}

export type ImageMetadata = {
  src: string
  mimeType: string
  width: number
  height: number
  size?: number
}

export type ImageSources = {
  original: ImageMetadata
  alternatives?: Array<ImageMetadata>
}

export type BasicProfile = {
  name?: string
  image?: ImageSources
  description?: string
  emoji?: string
  background?: ImageSources
  birthDate?: string
  url?: string
  gender?: string
  homeLocation?: string
  residenceCountry?: string
  nationalities?: Array<string>
  affiliations?: Array<string>
}

