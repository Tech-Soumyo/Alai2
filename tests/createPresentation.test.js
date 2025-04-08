import {
  createPresentation,
  addSlide,
  updateSlideContent,
  createSlideVariant,
} from "../src/api/alai.js";

(async () => {
  try {
    // Create a presentation
    const presentationId = await createPresentation("Test Presentation");
    console.log("Created Presentation ID:", presentationId);

    // Add a slide
    const slideOrder = 0;
    const slideId = await addSlide(presentationId, slideOrder);
    console.log("Added Slide ID:", slideId);

    // Create a variant for the slide
    const { variantId, headingId, bodyId } = await createSlideVariant(slideId);
    console.log("Created Variant ID:", variantId);
    console.log("Created heading ID:", headingId);
    console.log("Created body ID:", bodyId);

    // Update slide content
    const heading = "Introduction";
    const body =
      "This is the introduction slide.\n\nIt contains some basic information.";
    await updateSlideContent(
      slideId,
      presentationId,
      heading,
      body,
      slideOrder,
      variantId,
      headingId,
      bodyId
    );
    console.log("Slide content updated successfully");
  } catch (error) {
    console.error("Test failed:", error.message);
  }
})();
