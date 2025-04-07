require("dotenv").config();

module.exports = {
  // Alai API Configuration
  ALAI_API_BASE_URL: "https://alai-standalone-backend.getalai.com",

  // Firecrawl API Configuration
  FIRECRAWL_API_KEY: process.env.FIRECRAWL_API_KEY,

  // API Endpoints
  ENDPOINTS: {
    AUTH: "/auth",
    CREATE_SLIDE: "/create-new-slide",
    CREATE_SLIDE_VARIANT: "/create-slide-variant-from-element-slide",
    DELETE_SLIDE: "/delete-slides",
    UPDATE_ELEMENTS: "/update-slide-entity",
  },

  // Default headers for API requests
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },

  // Authentication
  ALAI_EMAIL: process.env.ALAI_EMAIL,
  ALAI_PASSWORD: process.env.ALAI_PASSWORD,

  // Application Settings
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 3000,
  API_TIMEOUT: parseInt(process.env.API_TIMEOUT) || 30000,
  SCRAPE_TIMEOUT: parseInt(process.env.SCRAPE_TIMEOUT) || 60000,
  DEBUG: process.env.DEBUG === "true",
};
