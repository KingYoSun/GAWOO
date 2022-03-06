module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.target = "web";
      config.node = {
        __dirname: true,
      };
    }
    config.output.globalObject = "this";
    return config;
  },
};
