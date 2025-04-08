import { scrapeWebpage } from "../src/utils/scraper.js";

(async () => {
  try {
    const url =
      "https://medium.com/gitconnected/my-favourite-software-architecture-patterns-0e57073b4be1";
    const markdown = await scrapeWebpage(url);
    console.log("Scraped Markdown:", markdown);
  } catch (error) {
    console.error("Test failed:", error);
  }
})();
