import { join } from "path";
import { app } from "electron";
import fs from "fs-extra";

export const fileHandler = (req, callback) => {
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

export const fileAbsolute = (req, callback) => {
  const path = decodeURI(req.url.replace("fileabsolute:///", ""));
  if (!fs.existsSync(path)) {
    callback({ error: -6 });
    return;
  }

  callback({ path });
};
