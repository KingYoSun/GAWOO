import { protocol } from "electron";
import { fileHandler, fileAbsolute } from "./file-handler";

export default function () {
  protocol.registerFileProtocol("filehandler", fileHandler);
  protocol.registerFileProtocol("fileabsolute", fileAbsolute);
}
