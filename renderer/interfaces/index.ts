import { Follow, Notice, Post, User } from "@prisma/client";
import {
  IIndexNotices,
  IIndexPosts,
  IpfsFile,
  IpfsPost,
  IPostPage,
  SignedJWS,
  TFile,
  WakuClientProps,
  WakuFollowSend,
} from "../types/general";

declare global {
  interface Window {
    electron: IElectron;
    ipfs: IIpfs;
    waku: IWaku;
  }
}

interface IElectron {
  sayMsg: (message: string) => void;
  setup: (callback: () => void) => void;
  confirmSetup: () => boolean;
  createUser: (user: User) => User | string;
  updateUser: (user: User) => User | string;
  showUser: (did: string) => User | string | null;
  indexPosts: (props: IIndexPosts) => { posts: Array<Post>; nextId: number };
  getFileByBase64: (ipfsFile: IpfsFile) => string;
  getFullPath: (type: string) => Array<string>;
  readLocalJson: (cid: string, name: string) => Post;
  countReply: (cid: string) => number;
  getPostPage: (props: IPostPage) => {
    postsArr: Array<Post>;
    countHasTopic: number;
    nextId: number;
  };
  getChildPosts: (props: IPostPage) => {
    addPosts: Array<Post>;
    nextId: number;
  };
  countUnreadNotice: (did: string) => number;
  addedNotice: (callback: (payload) => void) => void;
  addNotice: (props: Notice) => void;
  indexNotice: (props: IIndexNotices) => {
    notices: Array<Notice>;
    nextId: number;
  };
  getLatestNoticeId: (did: string) => number;
  openUserPage: (callback: (did: string) => void) => void;
  getFollowStatus: (
    baseDid: string,
    did: string
  ) => {
    isFollow: boolean;
    isFollower: boolean;
    error: string;
  };
  createFollow: (props: WakuFollowSend) => { follow: Follow; error: string };
  deleteFollow: (props: WakuFollowSend) => { follow: Follow; error: string };
}

interface IIpfs {
  createPost: (
    post: Post,
    files: Array<TFile>,
    pin: boolean
  ) => { post: Post; failures: Array<string> };
  imageToIpfs: (image: string, pin: boolean) => string | Error;
  catImage: (ipfsPath: string, mimeType: string) => string;
  getPost: (cat: string) => IpfsPost;
}

interface IWaku {
  init: () => boolean;
  isConnected: () => boolean;
  addObservers: (props: Array<WakuClientProps>) => string;
  deleteObservers: (props: Array<WakuClientProps>) => string;
  sendMessage: (prop: WakuClientProps) => string;
  followMessage: (callback: (payload: SignedJWS) => void) => void;
  sharePost: (callback: (payload) => void) => void;
  retriveInstanceMessages: (props: Array<WakuClientProps>) => {
    articles: Array<SignedJWS>;
    error: string | null;
  };
  editFollowsFromWaku: (props: Array<WakuClientProps>) => {
    error: string | null;
  };
}

export {};
