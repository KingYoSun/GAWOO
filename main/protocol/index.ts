import { protocol } from "electron";
import fileHandler from "./file-handler";

export default function () {
  protocol.registerFileProtocol("filehandler", fileHandler);
}
