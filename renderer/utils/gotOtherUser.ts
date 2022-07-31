import { Core } from "@self.id/core";
import { CERAMIC_NETWORK } from "../constants/identity";
import { BasicProfile } from "../types/general";

export default async function gotOtherUser(did: string) {
  const selfIdCore = new Core({ ceramic: CERAMIC_NETWORK });
  const res = (await selfIdCore
    .get("basicProfile", did as string)
    .catch((e) => {
      throw e;
    })) as BasicProfile;
  const userRes = await window.electron.showUser(did as string);
  if (typeof userRes !== "object" && typeof userRes !== "string") {
    await window.electron.createUser({
      id: 0,
      did: did as string,
      name: res.name,
      avatar: typeof res?.image === "number" ? null : res?.image?.original.src,
    });
  } else if (typeof userRes === "object") {
    await window.electron.updateUser({
      id: userRes.id,
      did: did as string,
      name: res.name,
      avatar: typeof res?.image === "number" ? null : res?.image?.original.src,
    });
  }

  return res;
}
