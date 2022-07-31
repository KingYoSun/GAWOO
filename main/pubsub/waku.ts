import protons from "protons";
import fs from "fs-extra";
import { mainContext } from "../background";
import { Waku, WakuMessage } from "js-waku";
import { WakuClientProps } from "../../renderer/types/general";
import { PrismaClient } from "@prisma/client";

export class WakuClient {
  client: Waku;
  connected: boolean;
  proto: any;
  prisma: PrismaClient;

  async initClient(prismaClient: PrismaClient) {
    this.proto = protons(fs.readFileSync("./main/pubsub/waku.proto"));

    this.prisma = prismaClient;
    this.client = await Waku.create({ bootstrap: { default: true } });
    await this.client.waitForRemotePeer();
    console.log("Connected waku peer!");
    this.connected = true;
  }

  setTopic(props: WakuClientProps) {
    return `/gawoo/1/${props.selfId}-${props.purpose}/proto`;
  }

  addObservers({ mainWindow }: mainContext, props: Array<WakuClientProps>) {
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

            const payload = this.proto.FollowMessage.decode(
              wakuMessage.payload
            );
            console.log("follow received!: ", JSON.stringify(payload));
            if (!payload.unfollow) {
              const userRecord = await this.prisma.user.findUnique({
                where: { did: payload.followerDid },
              });
              if (!Boolean(userRecord)) {
                await this.prisma.user.create({
                  data: { did: payload.followerDid, name: payload.followerDid },
                });
              }
              await this.prisma.follow.create({
                data: {
                  userDid: payload.followerDid,
                  followingDid: propFollow.selfId,
                },
              });
            } else {
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

            await this.prisma.notice.create({
              data: {
                read: false,
                did: propFollow.selfId,
                type: "followed",
                content: `${payload.followerName}からフォローされました！`,
                url: `/users/${payload.followerDid}`,
                createdAt: payload.timestamp,
              },
            });

            mainWindow.webContents.send("addedNotice", {
              message: "notice added",
            });
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

            const payload = this.proto.SharePost.decode(wakuMessage.payload);
            console.log("share received!: ", JSON.stringify(payload));
            mainWindow.webContents.send("sharePost", payload);
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
}

export default async function setupWaku(ctx, prismaClient: PrismaClient) {
  ctx.wakuClient = new WakuClient();
  await ctx.wakuClient.initClient(prismaClient);
}
