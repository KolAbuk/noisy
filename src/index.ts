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
  });
  try {
    let sites: string[] = config.sites;
    const blacklist: string[] = config.blacklist;
    let i = 0;
    while (i < sites.length) {
      try {
        logger.success(`Open ${sites[i]}`);
        const urls = await openUrl(sites[i]);
        sites = [...sites, ...urls];
        sites = sites.filter(
          (el, id, arr) => id == arr.lastIndexOf(el) && el.trim() != ""
        );
        for (let o = 0; o < blacklist.length; o++) {
          sites = sites.filter((el) => !el.includes(blacklist[o]));
        }
        if (i % 5 == 0) {
          logger.log(`Sites len ${sites.length}`);
        }
      } catch (err: any) {
        logger.warn(err.message);
      } finally {
        const timeout = Math.ceil(Math.random() * 7000);
        logger.success(`Timeout ${timeout} ms`);
        await new Promise((res) => setTimeout(res, timeout));
        if (i == sites.length - 1) {
          i = 0;
        } else {
          i++;
        }
      }
    }
  } catch (e: any) {
    logger.error(e.stack);
  }
})();
