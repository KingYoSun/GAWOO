import protons from "protons";
import fs from "fs-extra";
import { mainContext } from "../background";
import { Waku, WakuMessage } from "js-waku";
import { IPostHistory, WakuClientProps } from "../../renderer/types/general";
import { PrismaClient } from "@prisma/client";
import moment from "moment";
import { refType } from "@mui/utils";
import { BrowserWindow } from "electron";

export class WakuClient {
  client: Waku;
  connected: boolean;
  proto: any;
  prisma: PrismaClient;
  mainWindow: BrowserWindow;

  async initClient({ mainWindow }: mainContext, prismaClient: PrismaClient) {
    this.proto = protons(fs.readFileSync("./main/pubsub/waku.proto"));

    this.mainWindow = mainWindow;
    this.prisma = prismaClient;
    this.client = await Waku.create({ bootstrap: { default: true } });
    await this.client.waitForRemotePeer();
    console.log("Connected waku peer!");
    this.connected = true;
    this.deleteAllObservers();
  }

  setTopic(props: WakuClientProps) {
    return `/gawoo/1/${props.selfId}-${props.purpose}/proto`;
  }

  decodeProtoMessage(wakuMessage) {
    if (!Boolean(wakuMessage.payload)) return;

    return this.proto.SignedJWS.decode(wakuMessage.payload);
  }

  async followUser(payload) {
    const followerRecord = await this.prisma.follow.findFirst({
      where: {
        userDid: payload.followerDid,
        followingDid: payload.selfId,
      },
    });

    const userRecord = await this.prisma.user.findUnique({
      where: { did: payload.followerDid },
    });
    if (!Boolean(userRecord)) {
      await this.prisma.user.create({
        data: { did: payload.followerDid, name: payload.followerDid },
      });
    }
    if (!Boolean(followerRecord)) {
      await this.prisma.follow.create({
        data: {
          userDid: payload.followerDid,
          followingDid: payload.selfId,
        },
      });
      await this.prisma.notice.create({
        data: {
          read: false,
          did: payload.selfId,
          type: "followed",
          content: `${payload.followerName}からフォローされました！`,
          url: `/users/${payload.followerDid}`,
          createdAt: String(payload.timestamp),
        },
      });
      this.mainWindow.webContents.send("addedNotice", {
        message: "Follow received",
      });
    }
  }

  async unfollowUser(payload) {
    const followerRecord = await this.prisma.follow.findFirst({
      where: {
        userDid: payload.followerDid,
        followingDid: payload.selfId,
      },
    });

    if (Boolean(followerRecord))
      this.prisma.follow.delete({
        where: {
          userDid_followingDid: {
            userDid: followerRecord.userDid,
            followingDid: followerRecord.followingDid,
          },
        },
      });
  }

  async addPost(payload, propShare) {
    // TODO
  }

  addObservers(props: Array<WakuClientProps>) {
    let topics = [];
    const propFollows = props.filter((prop) => prop.purpose === "follow");
    const propShares = props.filter((prop) => prop.purpose === "share");

    const existObservers = Object.keys(this.client.relay.observers);

    if (propFollows.length > 0) {
      propFollows.map((propFollow) => {
        let topicFollow = this.setTopic(propFollow);

        if (!existObservers.includes(topicFollow)) {
          topics.push(topicFollow);

          const processIncomingMessageFollow = async (wakuMessage) => {
            if (!Boolean(wakuMessage.payload)) return;

            const payload = this.decodeProtoMessage(wakuMessage);
            console.log("follow received!");
            this.mainWindow.webContents.send("followMessage", payload);
          };
          this.client.relay.addObserver(processIncomingMessageFollow, [
            topicFollow,
          ]);
        }
      });
    }

    console.log(
      "Listen waku topic!: ",
      Object.keys(this.client.relay.observers)
    );
  }

  deleteObservers(props: Array<WakuClientProps>) {
    let topics = [];
    props.map((prop) => topics.push(this.setTopic(prop)));
    console.log("del topics!: ", topics);

    this.client.relay.deleteObserver((msg) => {}, topics);
  }

  deleteAllObservers() {
    let topics = Object.keys(this.client.relay.observers);
    if (topics.length > 0)
      this.client.relay.deleteObserver((msg) => {}, topics);
  }

  async sendMessage(props: WakuClientProps) {
    if (props.purpose === "follow" && Boolean(props.post)) return;

    const topic = this.setTopic(props);
    let payload = this.proto.SignedJWS.encode(props.jws);

    const wakuMessage = await WakuMessage.fromBytes(payload, topic);

    await this.client.relay.send(wakuMessage);

    console.log("Send message on waku to: ", topic);
  }

  async reveiveFollowInstanceMessages(props: Array<WakuClientProps>) {
    let articles = [];
    const callback = (retrivedMessages) => {
      articles = articles.concat(
        retrivedMessages
          .map((wakuMessage) => {
            if (!Boolean(wakuMessage.payload)) return;

            return this.decodeProtoMessage(wakuMessage);
          })
          .filter(Boolean)
      );
    };

    await Promise.all(
      props.map(async (prop) => {
        let topic = this.setTopic(prop);

        // defaultで1日前
        const startTime = Boolean(prop.startTime)
          ? new Date(parseInt(prop.startTime))
          : moment().subtract(30, "days").toDate();

        await this.client.store
          .queryHistory([topic], {
            callback,
            timeFilter: { startTime, endTime: new Date() },
          })
          .catch((e) => {
            console.log("Failed to retrieve messages from topic: ", e);
            throw e;
          });
      })
    );

    console.log(`${articles.length} articles have been retrieved`);
    console.log("retriveFollowArticles!: ", articles);
    return articles;
  }

  async setTopicsFromFollowings(selfId: string) {
    const followings = await this.prisma.follow.findMany({
      where: { userDid: selfId },
    });
    if (followings.length === 0) return;

    const followingDids = followings.map((following) => following.followingDid);
    const topics = followingDids.map((followingDid) =>
      this.setTopic({
        selfId: followingDid,
        purpose: "share",
      })
    );
    return topics;
  }

  async addFollowingShareObservers(selfId: string) {
    const topics = await this.setTopicsFromFollowings(selfId);

    const processIncomingMessageShare = async (wakuMessage) => {
      if (!Boolean(wakuMessage.payload)) return;

      const payload = this.decodeProtoMessage(wakuMessage);
      console.log("share received!");
      this.mainWindow.webContents.send("shareMessage", payload);
    };

    this.client.relay.addObserver(processIncomingMessageShare, topics);
  }

  async retriveShareInstanceMessages(props: IPostHistory) {
    const topics = await this.setTopicsFromFollowings(props.selfId);

    let articles = [];
    const callback = (retrivedMessages) => {
      articles = articles.concat(
        retrivedMessages
          .map((wakuMessage) => {
            if (!Boolean(wakuMessage.payload)) return;

            return this.decodeProtoMessage(wakuMessage);
          })
          .filter(Boolean)
      );
    };
    // defaultで1日前
    const startTime = Boolean(props.startTime)
      ? new Date(parseInt(props.startTime))
      : moment().subtract(30, "days").toDate();

    await this.client.store
      .queryHistory(topics, {
        callback,
        timeFilter: { startTime, endTime: new Date() },
      })
      .catch((e) => {
        console.log("Failed to retrieve messages from topic: ", e);
        throw e;
      });

    console.log(`${articles.length} articles have been retrieved`);
    console.log("retriveShareArticles!: ", articles);
    return articles;
  }
}

export default async function setupWaku(ctx, prismaClient: PrismaClient) {
  ctx.wakuClient = new WakuClient();
  await ctx.wakuClient.initClient(ctx, prismaClient);
}
