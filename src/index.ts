// src/index.ts

// Configuration
const CONFIG = {
  API_ENDPOINT: "https://automation.unipack.asia/webhook/kabira/booking/",
  DEBUG_ENDPOINT: "https://automation.unipack.asia/webhook-test/kabira/booking/",
  CACHE_DURATION: 30 * 60 * 1000, // 30 minutes in milliseconds
};

// Cache management
interface CacheEntry {
  timestamp: number;
  data: any;
}

let dataCache: CacheEntry | null = null;

export default {
  async fetch(request) {
    try {
      const url = new URL(request.url);
      const path = url.pathname;
      const isDebug = path.includes('/debug');

      // CORS headers for all responses
      const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      };

      // Handle OPTIONS requests (for CORS)
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: corsHeaders,
          status: 204,
        });
      }

      // Main endpoint for all data
      if (path === "/" || path === "/debug" || path === "") {
        console.log(`Fetching data in ${isDebug ? 'debug' : 'normal'} mode...`);

        // Check if we have cached data and it's still valid
        const now = Date.now();
        let data;
        let fromCache = false;

        if (dataCache && (now - dataCache.timestamp) < CONFIG.CACHE_DURATION && !isDebug) {
          console.log("Using cached data");
          data = dataCache.data;
          fromCache = true;
        } else {
          console.log("Fetching fresh data from API");
          data = await fetchDataFromAPI(isDebug);

          // Store in cache if not in debug mode
          if (!isDebug) {
            dataCache = {
              timestamp: now,
              data: data
            };
          }
        }

        // Include cache information in debug mode
        const responseBody = isDebug
          ? {
            status: "success",
            debug: {
              fromCache,
              cacheAge: fromCache ? Math.round((now - dataCache!.timestamp) / 1000) + " seconds" : null,
              endpoint: isDebug ? CONFIG.DEBUG_ENDPOINT : CONFIG.API_ENDPOINT,
            },
            data
          }
          : {
            status: "success",
            data
          };

        return new Response(JSON.stringify(responseBody, null, isDebug ? 2 : 0), {
          headers: {
            "content-type": "application/json",
            ...corsHeaders
          },
          status: 200,
        });
      } else {
        // Any other path returns a 404
        return new Response(JSON.stringify({
          status: "error",
          message: "Endpoint not found"
        }), {
          headers: {
            "content-type": "application/json",
            ...corsHeaders
          },
          status: 404,
        });
      }

    } catch (err) {
      console.error("Error in request handler:", err);
      return new Response(JSON.stringify({
        status: "error",
        message: "Internal server error",
        details: err.message
      }), {
        headers: {
          "content-type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        status: 500,
      });
    }
  },
};

async function fetchDataFromAPI(isDebug: boolean): Promise<any> {
  try {
    const endpoint = isDebug ? CONFIG.DEBUG_ENDPOINT : CONFIG.API_ENDPOINT;
    console.log(`Fetching data from: ${endpoint}`);

    const startTime = Date.now();
    const response = await fetch(endpoint);
    const endTime = Date.now();

    if (!response.ok) {
      console.error(`Failed to fetch data: ${response.status} ${response.statusText}`);
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Data fetched successfully in ${endTime - startTime}ms`);

    // Process the data to organize it by tables
    return processData(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

function processData(rawData: any[]): Record<string, any[]> {
  // Initialize tables
  const tables: Record<string, any[]> = {
    models: [],
    variants: [],
    colors: [],
    components: [],
    pricing: [],
    insurance_providers: [],
    insurance_plans: [],
    finance_providers: [],
    finance_options: []
  };

  // Given your sample data structure, we need to distinguish records by their fields
  // This is a heuristic approach based on the data you provided
  for (const item of rawData) {
    // Skip row_number field from the output
    const { row_number, ...cleanedItem } = item;

    // Classify based on properties
    if (item.model_code && !item.model_id) {
      tables.models.push(cleanedItem);
    } else if (item.battery_capacity && item.range_km) {
      tables.variants.push(cleanedItem);
    } else if (item.color_value) {
      tables.colors.push(cleanedItem);
    } else if (item.component_type) {
      tables.components.push(cleanedItem);
    } else if (item.pincode_start && item.pincode_end) {
      tables.pricing.push(cleanedItem);
    } else if (item.logo_url && !item.provider_id && !item.plan_type && !item.interest_rate) {
      // This could be either insurance or finance provider
      if (item.name.includes("BANK")) {
        tables.finance_providers.push(cleanedItem);
      } else {
        tables.insurance_providers.push(cleanedItem);
      }
    } else if (item.plan_type) {
      tables.insurance_plans.push(cleanedItem);
    } else if (item.interest_rate) {
      tables.finance_options.push(cleanedItem);
    }
  }

  return tables;
}
