import protons from "protons";
import { Post } from "@prisma/client";
import fs from "fs-extra";
import { mainContext } from "../background";
import { Waku, WakuMessage } from "js-waku";
import { WakuClientProps } from "../../renderer/types/general";

export class WakuClient {
  client: Waku;
  connected: boolean;
  proto: any;

  async initClient() {
    this.proto = protons(fs.readFileSync("./main/pubsub/waku.proto"));

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
    const propFollow = props.find((prop) => prop.purpose === "follow");
    const propShare = props.find((prop) => prop.purpose === "share");

    const existObservers = Object.keys(this.client.relay.observers);

    if (Boolean(propFollow)) {
      let topicFollow = this.setTopic(propFollow);

      if (!existObservers.includes(topicFollow)) {
        topics.push(topicFollow);

        const processIncomingMessageFollow = (wakuMessage) => {
          if (!wakuMessage.payload) return;

          const payload = this.proto.FollowMessage.decode(wakuMessage.payload);
          console.log("follow received!: ", payload);
          mainWindow.webContents.send("followMessage", JSON.stringify(payload));
        };
        this.client.relay.addObserver(
          (msg) => processIncomingMessageFollow,
          [topicFollow]
        );
      }
    }

    if (Boolean(propShare)) {
      let topicShare = this.setTopic(propShare);

      if (!existObservers.includes(topicShare)) {
        topics.push(topicShare);

        const processIncomingMessageShare = (wakuMessage) => {
          if (!wakuMessage.payload) return;

          const payload = this.proto.SharePost.decode(wakuMessage.payload);
          console.log("share received!: ", payload);
          mainWindow.webContents.send("sharePost", JSON.stringify(payload));
        };
        this.client.relay.addObserver(
          (msg) => processIncomingMessageShare,
          [topicShare]
        );
      }
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
        followerDid: props.selfId,
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

export default async function setupWaku(ctx) {
  ctx.wakuClient = new WakuClient();
  await ctx.wakuClient.initClient();
}
