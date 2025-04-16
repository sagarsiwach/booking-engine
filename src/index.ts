// src/index.ts
export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const path = url.pathname;
      const params = url.searchParams;

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

      // Only allow GET requests
      if (request.method !== "GET") {
        return new Response(JSON.stringify({
          status: "error",
          message: "Method not allowed"
        }), {
          headers: {
            "content-type": "application/json",
            ...corsHeaders
          },
          status: 405,
        });
      }

      // Fetch all necessary data from Google Sheets first
      // We'll need this data for all endpoint operations
      const [
        models,
        variants,
        colors,
        components,
        pricing,
        insuranceProviders,
        insurancePlans,
        financeProviders,
        financeOptions
      ] = await Promise.all([
        fetchSheetData('models'),
        fetchSheetData('variants'),
        fetchSheetData('colors'),
        fetchSheetData('components'),
        fetchSheetData('pricing'),
        fetchSheetData('insurance_providers'),
        fetchSheetData('insurance_plans'),
        fetchSheetData('finance_providers'),
        fetchSheetData('finance_options')
      ]);

      // Route the request to the appropriate handler
      let response;

      if (path.match(/^\/v1\/vehicles\/?$/)) {
        response = getVehicles(params, { models, variants, colors, components, pricing });
      } else if (path.match(/^\/v1\/vehicles\/[^\/]+\/?$/)) {
        const vehicleId = path.split('/').filter(Boolean)[2];
        response = getVehicleById(vehicleId, params, { models, variants, colors, components, pricing });
      } else if (path.match(/^\/v1\/pricing\/?$/)) {
        response = getPricing(params, { models, variants, pricing });
      } else if (path.match(/^\/v1\/insurance\/options\/?$/)) {
        response = getInsuranceOptions(params, { models, insuranceProviders, insurancePlans });
      } else if (path.match(/^\/v1\/financing\/options\/?$/)) {
        response = getFinancingOptions(params, { models, variants, pricing, financeProviders, financeOptions });
      } else {
        // Not found
        response = new Response(JSON.stringify({
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

      // Add CORS headers to the response
      const originalHeaders = response.headers;
      const newHeaders = new Headers(originalHeaders);

      Object.keys(corsHeaders).forEach(key => {
        newHeaders.set(key, corsHeaders[key]);
      });

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });

    } catch (err) {
      return new Response(JSON.stringify({
        status: "error",
        message: "Internal server error",
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
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

// Fetch data from Google Sheets
async function fetchSheetData(sheetName) {
  // The Google Sheets published URL
  const sheetsUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSmWYyNXHGa_SHzJt8e01Hl1xgnwqFTKp7uM4Grj2KNhQyz7_2djFbkhxAh0wZYUpiRhQAsfsZLKArd/pubhtml';

  try {
    // Fetch the HTML content
    const response = await fetch(sheetsUrl);
    const htmlContent = await response.text();

    // Extract the table data for the specified sheet
    // This is a simple extraction - you might need a more robust solution
    const regex = new RegExp(`<table[^>]*id="${sheetName}"[^>]*>([\\s\\S]*?)<\\/table>`);
    const match = htmlContent.match(regex);

    if (!match) {
      console.error(`Sheet "${sheetName}" not found`);
      return [];
    }

    // Parse table HTML to get TSV data
    const tableHtml = match[0];
    return parseTableToObjects(tableHtml);
  } catch (error) {
    console.error(`Error fetching sheet "${sheetName}":`, error);
    return [];
  }
}

// Parse HTML table to JavaScript objects
function parseTableToObjects(tableHtml) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(tableHtml, 'text/html');
  const rows = doc.querySelectorAll('tr');

  if (rows.length < 2) return []; // Need at least header + one data row

  // Extract headers from first row
  const headers = Array.from(rows[0].querySelectorAll('th, td')).map(cell =>
    cell.textContent.trim().toLowerCase()
  );

  // Extract data rows
  const results = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const cells = Array.from(row.querySelectorAll('td'));

    // Skip rows with wrong number of cells
    if (cells.length !== headers.length) continue;

    const rowData = {};
    headers.forEach((header, index) => {
      let value = cells[index].textContent.trim();

      // Convert to appropriate types
      if (value === 'TRUE' || value === 'true') value = true;
      else if (value === 'FALSE' || value === 'false') value = false;
      else if (!isNaN(value) && value !== '') value = Number(value);

      rowData[header] = value;
    });

    results.push(rowData);
  }

  return results;
}

// Handler functions
function getVehicles(params, data) {
  const { models, variants, colors, components, pricing } = data;
  const locationId = params.get('location_id');
  const include = params.get('include')?.split(',') || [];

  let includeVariants = include.includes('variants');
  let includeColors = include.includes('colors');
  let includeComponents = include.includes('components');

  // Filter models by location if needed
  let filteredModels = models;
  if (locationId) {
    const locationPricing = pricing.filter(p =>
      p.state === locationId || p.city === locationId
    );
    const modelIds = locationPricing.map(p => p.model_id);
    filteredModels = models.filter(m => modelIds.includes(m.id));
  }

  // Enhance vehicles with pricing and requested relations
  const enhancedVehicles = filteredModels.map(model => {
    // Find base price
    const modelPricing = pricing.find(p =>
      p.model_id === model.id && !p.pincode_start && !p.pincode_end
    );

    const basePrice = modelPricing ? modelPricing.base_price : 0;

    const enhancedVehicle = {
      ...model,
      base_price: basePrice,
      formatted_price: formatPrice(basePrice)
    };

    // Add variants if requested
    if (includeVariants) {
      enhancedVehicle.variants = variants
        .filter(v => v.model_id === model.id)
        .map(v => ({
          ...v,
          is_default: Boolean(v.is_default)
        }));
    }

    // Add colors if requested
    if (includeColors) {
      enhancedVehicle.colors = colors
        .filter(c => c.model_id === model.id)
        .map(c => ({
          ...c,
          is_default: Boolean(c.is_default)
        }));
    }

    // Add components if requested
    if (includeComponents) {
      enhancedVehicle.components = components
        .filter(c => c.model_id === model.id)
        .map(c => ({
          ...c,
          is_required: Boolean(c.is_required)
        }));
    }

    return enhancedVehicle;
  });

  return new Response(JSON.stringify({
    status: "success",
    data: {
      vehicles: enhancedVehicles
    },
    meta: {
      total: enhancedVehicles.length
    }
  }), {
    headers: { "content-type": "application/json" },
    status: 200,
  });
}

function getVehicleById(vehicleId, params, data) {
  const { models, variants, colors, components, pricing } = data;
  const include = params.get('include')?.split(',') || [];

  let includeVariants = include.includes('variants');
  let includeColors = include.includes('colors');
  let includeComponents = include.includes('components');

  // Find vehicle by ID or model_code
  const vehicle = models.find(m =>
    m.id.toString() === vehicleId || m.model_code === vehicleId
  );

  if (!vehicle) {
    return new Response(JSON.stringify({
      status: "error",
      message: "Vehicle not found"
    }), {
      headers: { "content-type": "application/json" },
      status: 404,
    });
  }

  // Find base price
  const modelPricing = pricing.find(p =>
    p.model_id === vehicle.id && !p.pincode_start && !p.pincode_end
  );

  const basePrice = modelPricing ? modelPricing.base_price : 0;

  const enhancedVehicle = {
    ...vehicle,
    base_price: basePrice,
    formatted_price: formatPrice(basePrice)
  };

  // Add variants if requested
  if (includeVariants) {
    enhancedVehicle.variants = variants
      .filter(v => v.model_id === vehicle.id)
      .map(v => ({
        ...v,
        is_default: Boolean(v.is_default)
      }));
  }

  // Add colors if requested
  if (includeColors) {
    enhancedVehicle.colors = colors
      .filter(c => c.model_id === vehicle.id)
      .map(c => ({
        ...c,
        is_default: Boolean(c.is_default)
      }));
  }

  // Add components if requested
  if (includeComponents) {
    enhancedVehicle.components = components
      .filter(c => c.model_id === vehicle.id)
      .map(c => ({
        ...c,
        is_required: Boolean(c.is_required)
      }));
  }

  return new Response(JSON.stringify({
    status: "success",
    data: {
      vehicle: enhancedVehicle
    }
  }), {
    headers: { "content-type": "application/json" },
    status: 200,
  });
}

function getPricing(params, data) {
  const { models, variants, pricing } = data;
  const vehicleId = params.get('vehicle_id');
  const variantId = params.get('variant_id');
  const locationCode = params.get('location_code');

  if (!vehicleId) {
    return new Response(JSON.stringify({
      status: "error",
      message: "vehicle_id is required"
    }), {
      headers: { "content-type": "application/json" },
      status: 400,
    });
  }

  // Find vehicle by ID or model_code
  const vehicle = models.find(m =>
    m.id.toString() === vehicleId || m.model_code === vehicleId
  );

  if (!vehicle) {
    return new Response(JSON.stringify({
      status: "error",
      message: "Vehicle not found"
    }), {
      headers: { "content-type": "application/json" },
      status: 404,
    });
  }

  // Get base pricing
  let basePricing = pricing.find(p =>
    p.model_id === vehicle.id && !p.pincode_start && !p.pincode_end
  );

  if (!basePricing) {
    return new Response(JSON.stringify({
      status: "error",
      message: "Pricing not found for this vehicle"
    }), {
      headers: { "content-type": "application/json" },
      status: 404,
    });
  }

  let pricingData = basePricing;
  let locationSpecific = false;

  // Check for location-specific pricing
  if (locationCode && /^\d{6}$/.test(locationCode)) {
    const locationPricing = pricing.find(p =>
      p.model_id === vehicle.id &&
      parseInt(locationCode) >= p.pincode_start &&
      parseInt(locationCode) <= p.pincode_end
    );

    if (locationPricing) {
      pricingData = locationPricing;
      locationSpecific = true;
    }
  }

  // Get variant pricing
  const modelVariants = variants.filter(v => v.model_id === vehicle.id);

  const variantPricing = modelVariants.map(v => {
    const totalPrice = pricingData.base_price + v.price_addition + (pricingData.fulfillment_fee || 0);
    return {
      variant_id: v.code,
      price_addition: v.price_addition,
      formatted_price_addition: formatPrice(v.price_addition),
      total_price: totalPrice,
      formatted_total_price: formatPrice(totalPrice)
    };
  });

  const baseTotal = pricingData.base_price + (pricingData.fulfillment_fee || 0);

  return new Response(JSON.stringify({
    status: "success",
    data: {
      pricing: {
        vehicle_id: vehicleId,
        base_price: pricingData.base_price,
        formatted_base_price: formatPrice(pricingData.base_price),
        fulfillment_fee: pricingData.fulfillment_fee || 0,
        formatted_fulfillment_fee: formatPrice(pricingData.fulfillment_fee || 0),
        total_price: baseTotal,
        formatted_total_price: formatPrice(baseTotal),
        location_specific: locationSpecific,
        variant_pricing: variantPricing
      }
    }
  }), {
    headers: { "content-type": "application/json" },
    status: 200,
  });
}

function getInsuranceOptions(params, data) {
  const { models, insuranceProviders, insurancePlans } = data;
  const vehicleId = params.get('vehicle_id');

  // Get tenures (hardcoded for now, but could extract from plans)
  const tenures = [
    { id: "1year", name: "01 Year", months: 12 },
    { id: "5years", name: "05 Years", months: 60 }
  ];

  // Get providers
  const providers = insuranceProviders;

  // Get insurance plans
  let plans = insurancePlans;

  if (vehicleId) {
    // Add vehicle-specific filtering logic here if needed
    // For now, we just return all plans as the data model doesn't show
    // a relationship between vehicles and specific insurance plans
  }

  // Separate core and additional plans
  const corePlans = plans
    .filter(p => p.plan_type === 'CORE')
    .map(p => ({
      ...p,
      formatted_price: formatPrice(p.price),
      is_required: Boolean(p.is_required)
    }));

  const additionalPlans = plans
    .filter(p => p.plan_type === 'ADDITIONAL')
    .map(p => ({
      ...p,
      formatted_price: formatPrice(p.price),
      is_required: Boolean(p.is_required)
    }));

  return new Response(JSON.stringify({
    status: "success",
    data: {
      insurance: {
        tenures,
        providers,
        core_plans: corePlans,
        additional_plans: additionalPlans
      }
    }
  }), {
    headers: { "content-type": "application/json" },
    status: 200,
  });
}

function getFinancingOptions(params, data) {
  const { models, variants, pricing, financeProviders, financeOptions } = data;
  const vehicleId = params.get('vehicle_id');
  const variantId = params.get('variant_id');
  const amount = parseInt(params.get('amount') || '0');

  if (!vehicleId && !amount) {
    return new Response(JSON.stringify({
      status: "error",
      message: "Either vehicle_id or amount is required"
    }), {
      headers: { "content-type": "application/json" },
      status: 400,
    });
  }

  // Calculate financing amount based on vehicle/variant or use provided amount
  let financingAmount = amount;

  if (vehicleId && !amount) {
    // Find vehicle by ID or model_code
    const vehicle = models.find(m =>
      m.id.toString() === vehicleId || m.model_code === vehicleId
    );

    if (!vehicle) {
      return new Response(JSON.stringify({
        status: "error",
        message: "Vehicle not found"
      }), {
        headers: { "content-type": "application/json" },
        status: 404,
      });
    }

    // Get base price
    const basePricing = pricing.find(p =>
      p.model_id === vehicle.id && !p.pincode_start && !p.pincode_end
    );

    if (!basePricing) {
      return new Response(JSON.stringify({
        status: "error",
        message: "Pricing not found for this vehicle"
      }), {
        headers: { "content-type": "application/json" },
        status: 404,
      });
    }

    financingAmount = basePricing.base_price;

    // Add variant price if specified
    if (variantId) {
      const variant = variants.find(v =>
        v.model_id === vehicle.id && v.code === variantId
      );

      if (variant) {
        financingAmount += variant.price_addition;
      }
    }
  }

  // Get providers
  const providers = financeProviders;

  // Get financing options and calculate EMI
  let options = financeOptions.map(option => {
    // Simple EMI calculation
    const loanAmount = financingAmount - option.min_downpayment;
    const monthlyInterestRate = option.interest_rate / (12 * 100);
    const emi = Math.round(
      loanAmount * monthlyInterestRate *
      Math.pow(1 + monthlyInterestRate, option.tenure_months) /
      (Math.pow(1 + monthlyInterestRate, option.tenure_months) - 1)
    );

    return {
      ...option,
      formatted_min_downpayment: formatPrice(option.min_downpayment),
      formatted_processing_fee: formatPrice(option.processing_fee),
      monthly_emi: emi,
      formatted_monthly_emi: formatPrice(emi)
    };
  });

  return new Response(JSON.stringify({
    status: "success",
    data: {
      financing: {
        amount: financingAmount,
        formatted_amount: formatPrice(financingAmount),
        providers,
        options
      }
    }
  }), {
    headers: { "content-type": "application/json" },
    status: 200,
  });
}

// Helper function to format price
function formatPrice(price) {
  if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} Lakhs`;
  } else {
    return `₹${price.toLocaleString('en-IN')}`;
  }
}
