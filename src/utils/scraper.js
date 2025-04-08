import FirecrawlApp from "@mendable/firecrawl-js";
import { config } from "../config/config.js";

export async function scrapeWebpage(url) {
  if (!url || !url.startsWith("http")) {
    throw new Error("Invalid URL provided");
  }

  try {
    const app = new FirecrawlApp({
      apiKey: config.FIRECRAWL_API_KEY,
    });

    const scrapeResponse = await app.scrapeUrl(url, {
      formats: ["markdown"],
      waitFor: 5000,
      timeout: 30000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
      },
    });

    // console.log(
    //   "Firecrawl API Response:",
    //   JSON.stringify(scrapeResponse, null, 2)
    // );

    if (!scrapeResponse || typeof scrapeResponse.success !== "boolean") {
      throw new Error(
        "Invalid response from Firecrawl: missing or invalid success field"
      );
    }

    if (!scrapeResponse.success) {
      throw new Error(
        `Scraping failed: ${scrapeResponse.error || "Unknown error"}`
      );
    }

    if (!scrapeResponse || !scrapeResponse.markdown) {
      throw new Error("No markdown content returned from Firecrawl");
    }

    const markdown = scrapeResponse.markdown;
    console.log("Webpage scraped successfully:", url);
    return markdown;
  } catch (error) {
    console.error("Error scraping webpage:", error.message);
    throw new Error(`Failed to scrape webpage: ${error.message}`);
  }
}
