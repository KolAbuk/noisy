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
const shuffle = <T>(array: T[]): T[] => {
  try {
    let currentIndex = array.length,
      randomIndex = 0;
    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }
    return array;
  } catch (e) {
    throw e;
  }
};

const filterUrls = (urls: string[], blacklist: string[]): string[] => {
  try {
    urls = urls.filter(
      (el, id, arr) => id == arr.lastIndexOf(el) && el.trim() != ""
    );
    for (let o = 0; o < blacklist.length; o++) {
      urls = urls.filter((el) => !el.includes(blacklist[o]));
    }
    return urls;
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
    while (sites.length) {
      let site: string | undefined;
      try {
        site = sites.shift();
        if (!site) continue;
        logger.success(`Open ${site}`);
        const urls = await openUrl(site);
        sites = filterUrls(
          shuffle([...sites, ...urls]),
          config.blacklist
        ).slice(0, 500);
      } catch (err: any) {
        logger.warn(`${err.message} ${site}`);
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
