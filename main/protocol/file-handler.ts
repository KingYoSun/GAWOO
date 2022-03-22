import { join } from "path";
import { app } from "electron";
import fs from "fs-extra";

const fileHandler = (req, callback) => {
  const path = join(
    app.getPath("userData"),
    "downloads",
    decodeURI(req.url.slice(15))
  );
  if (!fs.existsSync(path)) {
    callback({ error: -6 });
    return;
  }

  callback({ path });
};

export default fileHandler;
