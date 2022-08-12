import { Post } from "@prisma/client";
import AccountUtils from "./identity/account-utils";

export default async function verifyPost(post: Post, account: AccountUtils) {
  if (!Boolean(post.jws)) return post;

  const jwsObj = JSON.parse(post.jws);
  if (Object.keys(jwsObj).length === 0) return post;

  const verifyJWS = await account?.selfId?.did.verifyJWS(jwsObj);

  let isVerified = true;
  Object.keys(verifyJWS.payload).map((key) => {
    if (key !== "cid" && verifyJWS.payload[key] !== post[key])
      isVerified = false;
  });

  if (isVerified) post.jws = "verified";
  return post;
}
