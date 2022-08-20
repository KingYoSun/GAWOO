import tmp from "tmp";
import Ctl from "ipfsd-ctl";

const { join } = require("path");

const factory = Ctl.createFactory({
  type: "go",
  ipfsHttpModule: require("ipfs-http-client"),
  ipfsBin: require("go-ipfs").path(),
  remote: false,
  disposable: true,
  test: true, // run on random ports
});

export async function makeRepository({ start = false }) {
  const { name: repoPath } = tmp.dirSync({
    prefix: "tmp_IPFS_PATH_",
    unsafeCleanup: true,
  });
  const configPath = join(repoPath, "config");

  const ipfsd = await factory.spawn({
    ipfsOptions: { repo: repoPath },
  });

  // manual init
  await ipfsd.init({
    profiles: ["test"],
  });

  const { id } = await ipfsd.api.id();
  if (start) await ipfsd.start();
  return { ipfsd, repoPath, configPath, peerId: id };
}

module.exports = {
  makeRepository,
};
