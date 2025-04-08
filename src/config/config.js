import dotenv from "dotenv";
dotenv.config();
// Load environment variables with error handling
// const result = dotenv.config();
// if (result.error) {
//   console.warn("Warning: .env file not found");
//   throw new Error("Environment variables are required");
// }

// // Validate required environment variables
// const requiredEnvVars = ["FIRECRAWL_API_KEY", "ALAI_EMAIL", "ALAI_PASSWORD"];
// for (const envVar of requiredEnvVars) {
//   if (!process.env[envVar]) {
//     throw new Error(`Missing required environment variable: ${envVar}`);
//   }
// }

export const config = {
  // API Keys and Authentication
  FIRECRAWL_API_KEY:
    process.env.FIRECRAWL_API_KEY || "fc-9f257ebceac54c128adf66942a53cc1b",
  ALAI_EMAIL: process.env.ALAI_EMAIL || "soumyo.tech.deep@gmail.com",
  ALAI_PASSWORD: process.env.ALAI_PASSWORD || "tech@Password2002",
  ALAI_API_KEY:
    process.env.ALAI_API_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzY2hvdHRoamdsamJ4amVyY3puIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTAxMTI0NzYsImV4cCI6MjAyNTY4ODQ3Nn0.3pZ7fQ9qWjBcX-oSLJ37P4D9ojrdTF1zdI1B4ONcxrE",

  // API URLs
  ALAI_AUTH_URL: "https://api.getalai.com/auth/v1/token?grant_type=password",
  ALAI_BASE_URL: "https://alai-standalone-backend.getalai.com",
};
