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
  refreshing: boolean;
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
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      };

      // Handle OPTIONS requests (for CORS)
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: corsHeaders,
          status: 204,
        });
      }

      // Handle manual cache refresh endpoint
      if (path === "/refresh-cache" && request.method === "POST") {
        console.log("Manual cache refresh requested");

        try {
          const data = await fetchDataFromAPI(false);
          dataCache = {
            timestamp: Date.now(),
            data: data,
            refreshing: false
          };

          return new Response(JSON.stringify({
            status: "success",
            message: "Cache refreshed successfully",
            timestamp: new Date().toISOString()
          }), {
            headers: {
              "content-type": "application/json",
              ...corsHeaders
            },
            status: 200,
          });
        } catch (error) {
          return new Response(JSON.stringify({
            status: "error",
            message: "Failed to refresh cache",
            error: error.message
          }), {
            headers: {
              "content-type": "application/json",
              ...corsHeaders
            },
            status: 500,
          });
        }
      }

      // Main endpoint for all data
      if (path === "/" || path === "/debug" || path === "") {
        console.log(`Handling request in ${isDebug ? 'debug' : 'normal'} mode...`);

        // Check cache status
        const now = Date.now();
        let data;
        let fromCache = false;
        let cacheNeedsRefresh = false;

        // Check if we have cached data and if it's valid
        if (dataCache && !isDebug) {
          fromCache = true;
          data = dataCache.data;

          // Check if cache is stale but not already being refreshed
          if ((now - dataCache.timestamp) > CONFIG.CACHE_DURATION && !dataCache.refreshing) {
            cacheNeedsRefresh = true;
          }
        } else {
          // No cache or debug mode - fetch data immediately
          console.log("Fetching fresh data from API");
          data = await fetchDataFromAPI(isDebug);

          // Store in cache if not in debug mode
          if (!isDebug) {
            dataCache = {
              timestamp: now,
              data: data,
              refreshing: false
            };
          }
        }

        // Background refresh cache if needed (after response is ready)
        if (cacheNeedsRefresh) {
          console.log("Scheduling background cache refresh");

          // Mark cache as being refreshed to prevent multiple simultaneous refresh attempts
          if (dataCache) {
            dataCache.refreshing = true;
          }

          // Background fetch without awaiting
          refreshCacheInBackground();
        }

        // Include cache information in debug mode
        const responseBody = isDebug
          ? {
            status: "success",
            debug: {
              fromCache,
              cacheAge: fromCache ? Math.round((now - dataCache!.timestamp) / 1000) + " seconds" : null,
              refreshScheduled: cacheNeedsRefresh,
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

// Background refresh function - doesn't block response
async function refreshCacheInBackground() {
  try {
    console.log("Background refresh started");
    const data = await fetchDataFromAPI(false);
    dataCache = {
      timestamp: Date.now(),
      data: data,
      refreshing: false
    };
    console.log("Background refresh completed successfully");
  } catch (error) {
    console.error("Background refresh failed:", error);
    // Reset refreshing flag on error
    if (dataCache) {
      dataCache.refreshing = false;
    }
  }
}

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
