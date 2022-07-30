import { app, protocol } from "electron";
import { fileHandler, fileAbsolute } from "./file-handler";
import path from "path";

export const GAWOOUSERSCHEME = "gawoo-user";

export default function () {
  protocol.registerFileProtocol("filehandler", fileHandler);
  protocol.registerFileProtocol("fileabsolute", fileAbsolute);

  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient(GAWOOUSERSCHEME, process.execPath, [
        path.resolve(process.argv[1]),
      ]);
    }
  } else {
    app.setAsDefaultProtocolClient(GAWOOUSERSCHEME);
  }
}
