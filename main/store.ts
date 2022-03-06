import electron from "electron";
import Store from "electron-store";

const defaults = {
  ipfsConfig: {
    type: "go",
    path: "",
    flags: [
      "--agent-version-suffix=desktop",
      "--migrate",
      "--enable-gc",
      "--routing=dhtclient",
    ],
  },
  language: electron.app.getLocale(),
  experiments: {},
  binaryPath: "",
};

const migrations = {
  ">0.13.2": (store) => {
    const flags = store.get("ipfsConfig.flags", []);
    const automaticGC = store.get("automaticGC", false);
    if (flags.includes("--enable-gc") && !automaticGC) {
      store.set("automaticGC", true);
    }
  },
  ">=0.17.0": (store) => {
    let flags = store.get("ipfsConfig.flags", []);

    const setVersionSuffix = "--agent-version-suffix=desktop";
    if (!flags.includes(setVersionSuffix)) {
      flags = flags.filter((f) => !f.startsWith("--agent-version-suffix="));
      flags.push("--agent-version-suffix=desktop");
      store.set("ipfsConfig.flags", flags);
    }
    if (flags.includes("--routing") && flags.includes("dhtclient")) {
      flags = flags
        .filter((f) => f !== "--routing")
        .filter((f) => f !== "dhtclient");
      flags.push("--routing=dhtclient");
      store.set("ipfsConfig.flags", flags);
    }
  },
};

const store = new Store({
  defaults,
  migrations,
});

export default store;
