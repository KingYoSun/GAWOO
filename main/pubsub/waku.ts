import protons from "protons";
import fs from "fs-extra";
import { mainContext } from "../background";
import { Waku, WakuMessage } from "js-waku";
import { WakuClientProps } from "../../renderer/types/general";
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
  }

  setTopic(props: WakuClientProps) {
    return `/gawoo/1/${props.selfId}-${props.purpose}/proto`;
  }

  decodeProtoMessage(wakuMessage, purpose: "follow" | "share") {
    if (!wakuMessage.payload) return;

    if (purpose === "follow") {
      return this.proto.FollowMessage.decode(wakuMessage.payload);
    }
    if (purpose === "share") {
      return this.proto.SharePost.decode(wakuMessage.payload);
    }
  }

  async followUser(payload, propFollow) {
    const followerRecord = await this.prisma.follow.findFirst({
      where: {
        userDid: payload.followerDid,
        followingDid: propFollow.selfId,
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
          followingDid: propFollow.selfId,
        },
      });
      await this.prisma.notice.create({
        data: {
          read: false,
          did: propFollow.selfId,
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

  async unfollowUser(payload, propFollow) {
    const followerRecord = await this.prisma.follow.findFirst({
      where: {
        userDid: payload.followerDid,
        followingDid: propFollow.selfId,
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
            if (!wakuMessage.payload) return;

            const payload = this.decodeProtoMessage(wakuMessage, "follow");
            console.log("follow received!: ", JSON.stringify(payload));
            if (!payload.unfollow) {
              this.followUser(payload, propFollow);
            } else {
              this.unfollowUser(payload, propFollow);
            }
          };
          this.client.relay.addObserver(processIncomingMessageFollow, [
            topicFollow,
          ]);
        }
      });
    }

    if (propShares.length > 0) {
      propShares.map((propShare) => {
        let topicShare = this.setTopic(propShare);

        if (!existObservers.includes(topicShare)) {
          topics.push(topicShare);

          const processIncomingMessageShare = (wakuMessage) => {
            if (!wakuMessage.payload) return;

            const payload = this.decodeProtoMessage(wakuMessage, "share");
            console.log("share received!: ", JSON.stringify(payload));
            this.mainWindow.webContents.send("sharePost", payload);
          };
          this.client.relay.addObserver(processIncomingMessageShare, [
            topicShare,
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

  async sendMessage(props: WakuClientProps) {
    if (props.purpose === "follow" && Boolean(props.post)) return;

    const topic = this.setTopic(props);

    let payload = new Uint8Array();

    if (props.purpose === "follow") {
      payload = this.proto.FollowMessage.encode({
        timestamp: Date.now(),
        followerDid: props.followerDid,
        followerName: props.followerName,
        unfollow: Boolean(props.unfollow),
      });
    }

    if (props.purpose === "share") {
      delete props.post.id;
      payload = this.proto.SharePost.encode({
        ...props.post,
        authorDid: props.selfId,
      });
    }

    const wakuMessage = await WakuMessage.fromBytes(payload, topic);

    await this.client.relay.send(wakuMessage);

    console.log("Send message on waku to: ", topic);
  }

  async reveiveInstanceMessages(props: Array<WakuClientProps>) {
    const resArticles = await Promise.all(
      props.map(async (prop) => {
        let articles = [];
        let topic = this.setTopic(prop);

        const callback = (retrivedMessages) => {
          articles = retrivedMessages
            .map((wakuMessage) =>
              this.decodeProtoMessage(wakuMessage, prop.purpose)
            )
            .filter(Boolean);
          console.log(`${articles.length} articles have been retrieved`);
        };

        // defaultで1日前
        console.log(prop.startTime);
        const startTime = Boolean(prop.startTime)
          ? new Date(parseInt(prop.startTime))
          : moment().subtract(30, "days").toDate();

        console.log(startTime);
        await this.client.store
          .queryHistory([topic], {
            callback,
            timeFilter: { startTime, endTime: new Date() },
          })
          .catch((e) => {
            console.log("Failed to retrieve messages from topic: ", e);
            throw e;
          });

        if (prop.purpose === "follow" && articles.length > 0) {
          articles.map(async (article) => {
            if (!article.unfollow) {
              await this.followUser(article, prop);
            } else {
              await this.unfollowUser(article, prop);
            }
          });
        }

        if (prop.purpose === "share" && articles.length > 0) {
          articles.map(async (article) => {
            this.addPost(article, prop);
          });
        }

        return articles;
      })
    );

    return resArticles;
  }
}

export default async function setupWaku(ctx, prismaClient: PrismaClient) {
  ctx.wakuClient = new WakuClient();
  await ctx.wakuClient.initClient(ctx, prismaClient);
}
