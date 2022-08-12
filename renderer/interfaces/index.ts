import { Follow, Notice, Post, User } from "@prisma/client";
import {
  IIndexNotices,
  IIndexPosts,
  IpfsFile,
  IpfsPost,
  IPostCreate,
  IPostHistory,
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
  createUser: (user: User) => { user: User | null; error: string | null };
  updateUser: (user: User) => { user: User | null; error: string | null };
  showUser: (did: string) => { user: User | null; error: string | null };
  indexPosts: (props: IIndexPosts) => { posts: Array<Post>; nextId: number };
  callPostCheck: (callback: (payload) => void) => void;
  countUnreadPosts: (props: IIndexPosts) => {
    count: number | null;
    error: string | null;
  };
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
  createPost: (props: IPostCreate) => { post: Post; errors: Array<string> };
  imageToIpfs: (
    image: string,
    pin: boolean
  ) => { image: string | null; error: string | null };
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
  shareMessage: (callback: (payload: SignedJWS) => void) => void;
  retriveFollowInstanceMessages: (props: Array<WakuClientProps>) => {
    articles: Array<SignedJWS>;
    error: string | null;
  };
  editFollowsFromWaku: (props: Array<WakuClientProps>) => {
    error: string | null;
  };
  addFollowingShareObservers: (selfId: string) => {
    error: string | null;
  };
  addPostsFromWaku: (posts: Array<Post>) => {
    error: string | null;
  };
  retriveShareInstanceMessages: (props: IPostHistory) => {
    articles: Array<SignedJWS>;
    error: string | null;
  };
}

export {};
