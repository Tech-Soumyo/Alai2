import { scrapeWebpage } from "./utils/scraper.js";
import {
  createPresentation,
  addSlide,
  createSlideVariant,
  updateSlideContent,
  generateShareableLink,
} from "./api/alai.js";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

function parseMarkdownToSlides(markdown) {
  const slides = [];
  let currentSlide = { heading: "", body: [] };
  const lines = markdown.split("\n");
  let isFirstHeading = true;
  const ignoredHeadings = [
    "menu",
    "using app router",
    "features available in /app",
    "using latest version",
    "15.2.4",
    "api reference",
    "file conventions",
  ]; // Headings to ignore (case-insensitive)

  for (const line of lines) {
    if (line.startsWith("## ")) {
      const headingText = line.replace("## ", "").trim().toLowerCase();

      if (ignoredHeadings.includes(headingText)) {
        continue;
      }

      // Push the current slide if it has content
      if (currentSlide.heading || currentSlide.body.length > 0) {
        slides.push({
          heading: currentSlide.heading || "Introduction",
          body: currentSlide.body.join("\n").trim(),
        });
      }
      currentSlide = { heading: line.replace("## ", "").trim(), body: [] };
    } else if (line.startsWith("# ") && isFirstHeading) {
      currentSlide.heading = line.replace("# ", "").trim();
      isFirstHeading = false;
    } else if (line.trim()) {
      let cleanedLine = line.trim();

      cleanedLine = cleanedLine.replace(/!\[.*?\]\(.*?\)/g, "");

      cleanedLine = cleanedLine.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
      if (cleanedLine.trim()) {
        currentSlide.body.push(cleanedLine);
      }
    }
  }

  if (currentSlide.heading || currentSlide.body.length > 0) {
    slides.push({
      heading: currentSlide.heading || "Introduction",
      body: currentSlide.body.join("\n").trim(),
    });
  }

  return slides;
}

async function summarizeSlidesWithGemini(slides) {
  // Combine all content into a single string to calculate character count
  const fullContent = slides
    .map((slide) => `## ${slide.heading}\n\n${slide.body}`)
    .join("\n\n");
  const charCount = fullContent.length;
  let targetSlideCount;

  if (charCount < 1000) {
    targetSlideCount = 2; // Low content size
  } else if (charCount >= 1000 && charCount <= 5000) {
    targetSlideCount = 5; // Medium content size
  } else {
    targetSlideCount = 10; // Large content size
  }

  // Truncate content if it exceeds Gemini API's input limit (e.g., 30,000 characters)
  const maxInputLength = 30000;
  const truncatedContent =
    fullContent.length > maxInputLength
      ? fullContent.substring(0, maxInputLength) +
        "\n\n[Content truncated due to length]"
      : fullContent;

  const prompt = `Summarize the following content into exactly ${targetSlideCount} sections, each with a heading (starting with ##) and a body. The body must have exactly 3 bullet points labeled "A.", "B.", and "C." (e.g., "A. ...", "B. ...", "C. ..."), with each bullet 80-90 characters long. Include at least one relevant emoji per bullet (e.g., 📝, ⚙️, 🔄). Ensure the headings are concise (under 50 characters) and the content is engaging:\n\n${truncatedContent}`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 1500,
          temperature: 0.7,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const summaryText = response.data.candidates[0].content.parts[0].text;
    console.log("Gemini API Summary:", summaryText);

    // Parse the AI response into slides
    const summarizedSlides = [];
    const sections = summaryText
      .split("## ")
      .filter((section) => section.trim());
    for (const section of sections) {
      const lines = section.split("\n").filter((line) => line.trim());
      const heading = lines[0].trim();
      const body = lines.slice(1).join("\n").trim();
      if (heading && body) {
        const bulletLines = body
          .split("\n")
          .filter((line) => line.match(/^[A-C]\./));
        if (bulletLines.length >= 3) {
          summarizedSlides.push({
            heading,
            body: bulletLines.slice(0, 3).join("\n"),
          });
        } else {
          summarizedSlides.push({
            heading,
            body: "A. Summary point 1 📝\nB. Summary point 2 ⚙️\nC. Summary point 3 🔄",
          });
        }
      }
    }

    return summarizedSlides.slice(0, targetSlideCount);
  } catch (error) {
    console.error(
      "Error summarizing with Gemini API:",
      error.response?.data || error.message
    );
    const sectionsPerSlide = Math.ceil(slides.length / targetSlideCount);
    const summarizedSlides = [];
    let currentSlide = { heading: "", body: [] };
    let sectionCount = 0;

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      sectionCount++;
      if (!currentSlide.heading) {
        currentSlide.heading = slide.heading;
      }
      currentSlide.body.push(slide.body);

      if (sectionCount >= sectionsPerSlide || i === slides.length - 1) {
        const combinedBody = currentSlide.body.join("\n\n");
        const bodyLines = combinedBody
          .split("\n")
          .filter((line) => line.trim());
        summarizedSlides.push({
          heading: currentSlide.heading,
          body: "A. Summary point 1 📝\nB. Summary point 2 ⚙️\nC. Summary point 3 🔄",
        });
        currentSlide = { heading: "", body: [] };
        sectionCount = 0;
      }
    }

    return summarizedSlides.slice(0, targetSlideCount);
  }
}
async function main(url) {
  try {
    // Step 1: Scrape the webpage
    const markdown = await scrapeWebpage(url);

    // Step 2: Parse markdown into slides
    let slides = parseMarkdownToSlides(markdown);

    // Step 3: Summarize using Gemini API based on character count
    slides = await summarizeSlidesWithGemini(slides);

    // Step 4: Create a presentation
    const presentationId = await createPresentation("Webpage Presentation");

    // Step 5: Add slides, create variants, and update content
    for (let i = 0; i < slides.length; i++) {
      const slideOrder = i;
      const slideId = await addSlide(presentationId, slideOrder);

      // Create a variant for the slide
      const { variantId, headingId, bodyId } = await createSlideVariant(
        slideId
      );

      // Update the slide content
      await updateSlideContent(
        slideId,
        presentationId,
        slides[i].heading,
        slides[i].body,
        slideOrder,
        variantId,
        headingId,
        bodyId
      );
      console.log(`Updated content for slide ${slideOrder}`);
    }

    const shareableUrl = await generateShareableLink(presentationId);
    console.log("Shareable URL:", shareableUrl);

    console.log(
      "Presentation created successfully with all slides and shareable link"
    );
    console.log("Presentation created successfully with all slides");
    return presentationId;
  } catch (error) {
    console.error("Main workflow failed:", error.message);
    throw error;
  }
}

const testUrl = "https://www.webpagetest.org/";
main(testUrl)
  .then((result) => {
    console.log("Final Result:", result);
  })
  .catch((err) => {
    console.error("Application failed:", err);
    process.exit(1);
  });
