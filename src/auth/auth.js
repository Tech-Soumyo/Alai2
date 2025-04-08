import axios from "axios";
import { config } from "../config/config.js";

// Module-level variables to store the token and its expiry
let accessToken = null;
let tokenExpiry = null;

export async function getAlaiToken() {
  // Check if the current token exists and hasn’t expired (with a 30-second buffer)
  if (accessToken && tokenExpiry - 30000 > Date.now()) {
    console.log("Returning cached Alai token");
    return accessToken;
  }

  try {
    // Make the POST request to fetch a new token
    const response = await axios.post(
      config.ALAI_AUTH_URL,
      {
        email: config.ALAI_EMAIL,
        password: config.ALAI_PASSWORD,
        gotrue_meta_security: {},
      },
      {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          apikey: config.ALAI_API_KEY,
          authorization: `Bearer ${config.ALAI_API_KEY}`,
        },
      }
    );

    // Extract token and expiry from the response
    const data = response.data;
    if (!data.access_token || !data.expires_at) {
      throw new Error(
        "Invalid response from Alai auth endpoint: missing access_token or expires_at"
      );
    }

    accessToken = data.access_token;
    tokenExpiry = data.expires_at * 1000; // Convert Unix timestamp (seconds) to milliseconds

    console.log("New Alai token obtained:", accessToken.slice(0, 10) + "...");
    return accessToken;
  } catch (error) {
    // Log detailed error information for debugging
    console.error(
      "Error fetching Alai token:",
      error.response?.data || error.message
    );
    throw new Error("Failed to obtain Alai token");
  }
}
