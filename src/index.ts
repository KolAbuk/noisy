import { Logger } from "@kolabuk/logger";
import { config } from "./config";
import fetch from "node-fetch";
import { parse } from "node-html-parser";

//

(async () => {
  const logger = new Logger({
    filePath: "./data/logs/index.txt",
    errorFilePath: "./data/logs/index.err.txt",
  });
  try {
  } catch (e: any) {
    logger.error(e.stack);
  }
})();
