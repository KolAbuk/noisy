import { Logger } from "@kolabuk/logger";
import { config } from "./config";
import fetch from "node-fetch";
import { parse } from "node-html-parser";
import { getRandom } from "random-useragent";

//
const openUrl = async (url: string): Promise<string[]> => {
  try {
    const res = await fetch(url, { headers: { "User-Agent": getRandom() } });
    const data = await res.text();
    const html = parse(data);
    const urls = html
      .querySelectorAll("a")
      .map((el) => el.getAttribute("href") || "")
      .filter((el) => el.includes("http"));
    return urls.slice(0, 20);
  } catch (e) {
    throw e;
  }
};

(async () => {
  const logger = new Logger({
    filePath: "./data/logs/index.txt",
    errorFilePath: "./data/logs/index.err.txt",
    debugMode: config.debugMode,
  });
  try {
    let sites: string[] = config.sites;
    const blacklist: string[] = config.blacklist;
    while (sites.length) {
      try {
        const site = sites.shift();
        if (!site) continue;
        logger.success(`Open ${site}`);
        const urls = await openUrl(site);
        sites = [...sites, ...urls].slice(0, 500);
        sites = sites.filter(
          (el, id, arr) => id == arr.lastIndexOf(el) && el.trim() != ""
        );
        for (let o = 0; o < blacklist.length; o++) {
          sites = sites.filter((el) => !el.includes(blacklist[o]));
        }
      } catch (err: any) {
        logger.warn(err.message);
      } finally {
        const timeout = Math.ceil(Math.random() * config.timeoutMax);
        logger.success(`Timeout ${timeout} ms`);
        await new Promise((res) => setTimeout(res, timeout));
        logger.debug(sites.length);
      }
    }
  } catch (e: any) {
    logger.error(e.stack);
  }
})();
