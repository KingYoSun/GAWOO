module.exports = {
  webpack: (config, env) => {
    Object.assign(config, {
      entry: {
        background: "./main/background.ts",
        preload: "./main/preload.ts",
      },
    });

    return config;
  },
};
