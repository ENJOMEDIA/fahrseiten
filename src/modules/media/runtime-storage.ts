import "server-only";

import os from "node:os";
import path from "node:path";

import { LocalMediaStorage } from "./storage";

export function getMediaStorageRoot() {
  return process.env.MEDIA_STORAGE_PATH
    ? path.resolve(process.env.MEDIA_STORAGE_PATH)
    : path.join(os.homedir(), ".fahrseiten", "media");
}

export function getMediaStorage() {
  return new LocalMediaStorage(getMediaStorageRoot());
}
