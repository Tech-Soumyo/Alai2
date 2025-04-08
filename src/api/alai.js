import axios from "axios";
import { getAlaiToken } from "../auth/auth.js";
import { config } from "../config/config.js";
import { v4 as uuidv4 } from "uuid";

export async function createPresentation(title) {
  // Get the access token
  const token = await getAlaiToken();

  // Define the payload
  const payload = {
    presentation_id: uuidv4(),
    presentation_title: title || "Untitled Presentation", // Default title if none provided
    create_first_slide: true,
    theme_id: "a6bff6e5-3afc-4336-830b-fbc710081012", // Hardcoded theme
    default_color_set_id: 0,
  };

  try {
    // Send POST request to create the presentation
    const response = await axios.post(
      `${config.ALAI_BASE_URL}/create-new-presentation`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = response.data;

    // Validate response
    if (!data.id) {
      throw new Error("Failed to create presentation: missing id in response");
    }

    // console.log("Presentation created successfully:", data.id);
    return data.id; // Return the presentation ID
  } catch (error) {
    // Log error details for debugging
    console.error(
      "Error creating presentation:",
      error.response?.data || error.message
    );
    throw new Error("Failed to create presentation");
  }
}

export async function addSlide(presentationId, slideOrder = 0) {
  // Validate input
  if (!presentationId || typeof presentationId !== "string") {
    throw new Error("Valid presentation ID is required");
  }

  // Get authentication token
  const token = await getAlaiToken();

  // Generate a unique slide ID (might be ignored by the API)
  const slideId = uuidv4();

  // Define the payload based on the curl command
  const payload = {
    slide_id: slideId,
    presentation_id: presentationId,
    product_type: "PRESENTATION_CREATOR",
    slide_order: slideOrder,
    color_set_id: 0,
  };

  try {
    // Send POST request to create the slide
    const response = await axios.post(
      `${config.ALAI_BASE_URL}/create-new-slide`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "*/*",
        },
      }
    );

    const data = response.data;

    // Log the full response for debugging
    // console.log("Create Slide API Response:", JSON.stringify(data, null, 2));

    // Check for error status
    if (data.status === "error") {
      throw new Error(
        `Failed to add slide: ${data.message || "Unknown error"}`
      );
    }

    // Check if the response has a top-level slide_id (from earlier example)
    if (data.slide_id) {
      // console.log("Slide added successfully:", data.slide_id);
      return data.slide_id;
    }

    // Otherwise, look for the slide in the slides array
    if (data.slides && Array.isArray(data.slides)) {
      // Find the slide with the matching slide_order
      const newSlide = data.slides.find(
        (slide) => slide.slide_order === slideOrder
      );
      if (newSlide && newSlide.id) {
        // console.log("Slide added successfully:", newSlide.id);
        return newSlide.id;
      }
    }

    // If no slide ID is found, throw an error
    throw new Error("Failed to add slide: unable to find slide ID in response");
  } catch (error) {
    console.error("Error adding slide:", error.response?.data || error.message);
    throw new Error("Failed to add slide");
  }
}

export async function createSlideVariant(slideId) {
  // Validate input
  if (!slideId || typeof slideId !== "string") {
    throw new Error("Valid slide ID is required");
  }

  // Get authentication token
  const token = await getAlaiToken();

  // Generate IDs for the variant and textboxes
  const variantId = uuidv4();
  const headingId = uuidv4();
  const bodyId = uuidv4();

  // Define the payload for creating a variant
  const payload = {
    slide_id: slideId,
    element_slide_variant: {
      type: "TITLE_AND_BODY_LAYOUT",
      elements: [
        [
          {
            id: headingId,
            type: "textbox",
            subtype: "heading",
            array_index: null,
            row_index: null,
            relative_position: {
              top: null,
              left: null,
            },
            dimensions: {
              widthFraction: null,
              minHeight: "auto",
              manualHeight: 56,
              height: null,
              width: null,
              paddingHorizontal: "auto",
              paddingVertical: "auto",
              shouldRecalculate: false,
              minGridColumnCount: 2,
              gridColumnCount: 24,
              horizontalAlignment: null,
              verticalAlignment: null,
            },
            preset_type: "textbox_basic",
            content: "# Placeholder Heading\n",
            prose_mirror_content: null,
            background: {
              fill: null,
              outline: null,
            },
          },
        ],
        [
          {
            id: bodyId,
            type: "textbox",
            subtype: "mixed",
            array_index: null,
            row_index: null,
            relative_position: {
              top: {
                element_id: headingId,
                delta: "auto",
              },
              left: null,
            },
            dimensions: {
              widthFraction: null,
              minHeight: "auto",
              manualHeight: 503,
              height: null,
              width: null,
              paddingHorizontal: "auto",
              paddingVertical: "auto",
              shouldRecalculate: false,
              minGridColumnCount: 2,
              gridColumnCount: 24,
              horizontalAlignment: null,
              verticalAlignment: null,
            },
            preset_type: "textbox_basic",
            content: "Placeholder body text.\n",
            prose_mirror_content: null,
            background: {
              fill: null,
              outline: null,
            },
          },
        ],
      ],
    },
  };

  try {
    const response = await axios.post(
      `${config.ALAI_BASE_URL}/create-slide-variant-from-element-slide`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "*/*",
        },
      }
    );

    const data = response.data;
    // console.log(
    //   "Create Slide Variant API Response:",
    //   JSON.stringify(data, null, 2)
    // );

    if (data.status === "error") {
      throw new Error(
        `Failed to create slide variant: ${data.message || "Unknown error"}`
      );
    }

    if (!data.id) {
      throw new Error(
        "Failed to create slide variant: missing variant ID in response"
      );
    }

    // console.log("Slide variant created successfully:", data.id);
    return {
      variantId: data.id, // Use the variant ID from the response
      headingId: headingId,
      bodyId: bodyId,
    };
  } catch (error) {
    console.error(
      "Error creating slide variant:",
      error.response?.data || error.message
    );
    throw new Error("Failed to create slide variant");
  }
}

export async function updateSlideContent(
  slideId,
  presentationId,
  heading,
  body,
  slideOrder,
  variantId,
  headingId,
  bodyId
) {
  if (!slideId || typeof slideId !== "string") {
    throw new Error("Valid slide ID is required");
  }
  if (!presentationId || typeof presentationId !== "string") {
    throw new Error("Valid presentation ID is required");
  }
  if (!heading || typeof heading !== "string") {
    throw new Error("Heading is required");
  }
  if (!body || typeof body !== "string") {
    throw new Error("Body content is required");
  }
  if (!variantId || typeof variantId !== "string") {
    throw new Error("Valid variant ID is required");
  }
  if (!headingId || typeof headingId !== "string") {
    throw new Error("Valid heading ID is required");
  }
  if (!bodyId || typeof bodyId !== "string") {
    throw new Error("Valid body ID is required");
  }

  const token = await getAlaiToken();

  const payload = {
    variants: [
      {
        id: variantId,
        slide_id: slideId,
        element_slide: {
          type: "TITLE_AND_BODY_LAYOUT",
          elements: [
            [
              {
                id: headingId,
                type: "textbox",
                subtype: "heading",
                array_index: null,
                row_index: null,
                relative_position: {
                  top: null,
                  left: null,
                },
                dimensions: {
                  widthFraction: null,
                  minHeight: "auto",
                  manualHeight: 56,
                  height: null,
                  width: null,
                  paddingHorizontal: "auto",
                  paddingVertical: "auto",
                  shouldRecalculate: false,
                  minGridColumnCount: 2,
                  gridColumnCount: 24,
                  horizontalAlignment: null,
                  verticalAlignment: null,
                },
                preset_type: "textbox_basic",
                content: `# ${heading}\n`,
                prose_mirror_content: JSON.stringify({
                  type: "doc",
                  content: [
                    {
                      type: "alaiContentWrapper",
                      attrs: { padding: null },
                      content: [
                        {
                          type: "alaiHeading",
                          attrs: {
                            fontFamily: "Figtree",
                            color: "#1c2024",
                            colorModified: false,
                            placeholderColor: "#020d1e5c",
                            fontSize: "64px",
                            fontSizeModified: false,
                            fontWeight: 600,
                            margin: "0px",
                            textAlign: "left",
                            textTransform: null,
                            letterSpacing: "-0.02em",
                            lineHeight: 1.2,
                            paragraphSpacing: "0px",
                          },
                          content: [{ type: "text", text: heading }],
                        },
                      ],
                    },
                  ],
                }),
                background: { fill: null, outline: null },
              },
            ],
            [
              {
                id: bodyId,
                type: "textbox",
                subtype: "mixed",
                array_index: null,
                row_index: null,
                relative_position: {
                  top: {
                    element_id: headingId,
                    delta: "auto",
                  },
                  left: null,
                },
                dimensions: {
                  widthFraction: null,
                  minHeight: "auto",
                  manualHeight: 503,
                  height: null,
                  width: null,
                  paddingHorizontal: "auto",
                  paddingVertical: "auto",
                  shouldRecalculate: false,
                  minGridColumnCount: 2,
                  gridColumnCount: 24,
                  horizontalAlignment: null,
                  verticalAlignment: null,
                },
                preset_type: "textbox_basic",
                content: body,
                prose_mirror_content: JSON.stringify({
                  type: "doc",
                  content: [
                    {
                      type: "alaiContentWrapper",
                      attrs: { padding: null },
                      content: [
                        {
                          type: "alaiNormalText",
                          attrs: {
                            fontFamily: "Figtree",
                            color: "#4d5159",
                            colorModified: false,
                            placeholderColor: "#020d1e5c",
                            fontSize: "30px",
                            fontSizeModified: false,
                            fontWeight: 500,
                            margin: "0px",
                            textAlign: "left",
                            textTransform: null,
                            letterSpacing: "5",
                            lineHeight: 1.4,
                            paragraphSpacing: "10px",
                          },
                          content: [{ type: "text", text: body }],
                        },
                      ],
                    },
                  ],
                }),
                background: { fill: null, outline: null },
              },
            ],
          ],
        },
        is_discarded: false,
        created_at: new Date().toISOString(),
      },
    ],
    id: slideId,
    presentation_id: presentationId,
    slide_order: slideOrder,
    color_set_id: 0,
    created_at: new Date().toISOString(),
    active_variant_id: variantId,
    slide_outline: null,
    slide_context: null,
    slide_instructions: null,
    presentation_context: null,
    slide_status: "DEFAULT",
  };

  try {
    const response = await axios.post(
      `${config.ALAI_BASE_URL}/update-slide-entity`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "*/*",
        },
      }
    );

    const data = response.data;
    // console.log(
    //   "Update Slide Content API Response:",
    //   JSON.stringify(data, null, 2)
    // );

    if (data.status === "error") {
      throw new Error(
        `Failed to update slide content: ${data.message || "Unknown error"}`
      );
    }

    return slideId;
  } catch (error) {
    console.error(
      "Error updating slide content:",
      error.response?.data || error.message
    );
    throw new Error("Failed to update slide content");
  }
}

export async function generateShareableLink(presentationId) {
  if (!presentationId || typeof presentationId !== "string") {
    throw new Error("Valid presentation ID is required");
  }

  const token = await getAlaiToken();

  const payload = {
    presentation_id: presentationId,
  };

  try {
    const response = await axios.post(
      `${config.ALAI_BASE_URL}/upsert-presentation-share`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "*/*",
        },
      }
    );

    const shareToken = response.data;
    console.log("Generate Shareable Link API Response:", shareToken);

    if (typeof shareToken !== "string") {
      throw new Error(
        "Failed to generate shareable link: invalid share token received"
      );
    }

    const shareableUrl = `https://app.getalai.com/view/${shareToken}`;
    console.log("Generated Shareable URL:", shareableUrl);
    return shareableUrl;
  } catch (error) {
    console.error(
      "Error generating shareable link:",
      error.response?.data || error.message
    );
    throw new Error("Failed to generate shareable link");
  }
}
