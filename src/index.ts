// src/index.ts
export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const path = url.pathname;

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

      // We'll just have a single endpoint for all data
      if (path === "/" || path === "") {
        // Fetch all sheet data
        const allData = await fetchAllSheetsData();

        return new Response(JSON.stringify({
          status: "success",
          data: allData
        }), {
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

// Fetch all sheets data from the CSV
async function fetchAllSheetsData() {
  const baseUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSmWYyNXHGa_SHzJt8e01Hl1xgnwqFTKp7uM4Grj2KNhQyz7_2djFbkhxAh0wZYUpiRhQAsfsZLKArd/pub";
  const sheets = [
    'models',
    'variants',
    'colors',
    'components',
    'pricing',
    'insurance_providers',
    'insurance_plans',
    'finance_providers',
    'finance_options'
  ];

  const dataPromises = sheets.map(async (sheetName) => {
    const sheetUrl = `${baseUrl}?gid=0&single=true&output=csv&sheet=${encodeURIComponent(sheetName)}`;
    try {
      const response = await fetch(sheetUrl);

      if (!response.ok) {
        console.error(`Failed to fetch sheet ${sheetName}: ${response.status}`);
        return { [sheetName]: [] };
      }

      const csvText = await response.text();
      const data = parseCSV(csvText);
      return { [sheetName]: data };
    } catch (error) {
      console.error(`Error processing sheet ${sheetName}:`, error);
      return { [sheetName]: [] };
    }
  });

  const results = await Promise.all(dataPromises);

  // Merge all sheet data into a single object
  return results.reduce((acc, result) => ({ ...acc, ...result }), {});
}

// Parse CSV to array of objects
function parseCSV(csvText) {
  const lines = csvText.split('\n');
  if (lines.length < 2) return [];

  const headers = parseCSVRow(lines[0]).map(header => header.toLowerCase());
  const results = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    const values = parseCSVRow(lines[i]);
    if (values.length !== headers.length) continue;

    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      let value = values[j];

      // Convert to appropriate types
      if (value === 'TRUE' || value === 'true') value = true;
      else if (value === 'FALSE' || value === 'false') value = false;
      else if (!isNaN(value) && value !== '') value = Number(value);

      obj[headers[j]] = value;
    }

    results.push(obj);
  }

  return results;
}

// Parse a CSV row, handling quoted fields
function parseCSVRow(row) {
  const values = [];
  let inQuotes = false;
  let currentValue = '';

  for (let i = 0; i < row.length; i++) {
    const char = row[i];

    if (char === '"') {
      // Handle escaped quotes (two double quotes in sequence)
      if (i + 1 < row.length && row[i + 1] === '"') {
        currentValue += '"';
        i++; // Skip the next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(currentValue);
      currentValue = '';
    } else {
      currentValue += char;
    }
  }

  // Add the last value
  values.push(currentValue);
  return values;
}
