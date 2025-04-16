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
      
      // Route the request to the appropriate handler
      let response;
      
      if (path.match(/^\/v1\/vehicles\/?$/)) {
        response = await getVehicles(params, env);
      } else if (path.match(/^\/v1\/vehicles\/[^\/]+\/?$/)) {
        const vehicleId = path.split('/').filter(Boolean)[2];
        response = await getVehicleById(vehicleId, params, env);
      } else if (path.match(/^\/v1\/pricing\/?$/)) {
        response = await getPricing(params, env);
      } else if (path.match(/^\/v1\/insurance\/options\/?$/)) {
        response = await getInsuranceOptions(params, env);
      } else if (path.match(/^\/v1\/financing\/options\/?$/)) {
        response = await getFinancingOptions(params, env);
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
} satisfies ExportedHandler<Env>;

// Handler functions
async function getVehicles(params, env) {
  const locationId = params.get('location_id');
  const include = params.get('include')?.split(',') || [];
  
  let includeVariants = include.includes('variants');
  let includeColors = include.includes('colors');
  let includeComponents = include.includes('components');
  
  // Query basic vehicle info
  let query = `
    SELECT 
      m.id, 
      m.model_code, 
      m.name, 
      m.description, 
      m.image_url,
      COALESCE(p.base_price, 0) as base_price
    FROM models m
    LEFT JOIN pricing p ON m.id = p.model_id AND p.pincode_start IS NULL
  `;
  
  if (locationId) {
    query += ` WHERE m.id IN (SELECT model_id FROM pricing WHERE state = ? OR city = ?)`;
  }
  
  const stmt = env.DB.prepare(query);
  let results;
  
  if (locationId) {
    results = await stmt.bind(locationId, locationId).all();
  } else {
    results = await stmt.all();
  }
  
  const vehicles = results.results || [];
  
  // Enhance vehicles with requested relations
  const enhancedVehicles = [];
  
  for (const vehicle of vehicles) {
    const enhancedVehicle = {
      ...vehicle,
      formatted_price: formatPrice(vehicle.base_price)
    };
    
    // Add variants if requested
    if (includeVariants) {
      const variantsStmt = env.DB.prepare(`
        SELECT * FROM variants WHERE model_id = ?
      `);
      const variantsResult = await variantsStmt.bind(vehicle.id).all();
      enhancedVehicle.variants = (variantsResult.results || []).map(v => ({
        ...v,
        is_default: Boolean(v.is_default)
      }));
    }
    
    // Add colors if requested
    if (includeColors) {
      const colorsStmt = env.DB.prepare(`
        SELECT * FROM colors WHERE model_id = ?
      `);
      const colorsResult = await colorsStmt.bind(vehicle.id).all();
      enhancedVehicle.colors = (colorsResult.results || []).map(c => ({
        ...c,
        is_default: Boolean(c.is_default)
      }));
    }
    
    // Add components if requested
    if (includeComponents) {
      const componentsStmt = env.DB.prepare(`
        SELECT * FROM components WHERE model_id = ?
      `);
      const componentsResult = await componentsStmt.bind(vehicle.id).all();
      enhancedVehicle.components = (componentsResult.results || []).map(c => ({
        ...c,
        is_required: Boolean(c.is_required)
      }));
    }
    
    enhancedVehicles.push(enhancedVehicle);
  }
  
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

async function getVehicleById(vehicleId, params, env) {
  const include = params.get('include')?.split(',') || [];
  
  let includeVariants = include.includes('variants');
  let includeColors = include.includes('colors');
  let includeComponents = include.includes('components');
  
  // Query vehicle by ID or model_code
  const vehicleStmt = env.DB.prepare(`
    SELECT 
      m.id, 
      m.model_code, 
      m.name, 
      m.description, 
      m.image_url,
      COALESCE(p.base_price, 0) as base_price
    FROM models m
    LEFT JOIN pricing p ON m.id = p.model_id AND p.pincode_start IS NULL
    WHERE m.id = ? OR m.model_code = ?
  `);
  
  const vehicleResult = await vehicleStmt.bind(vehicleId, vehicleId).all();
  
  if (!vehicleResult.results || vehicleResult.results.length === 0) {
    return new Response(JSON.stringify({
      status: "error",
      message: "Vehicle not found"
    }), {
      headers: { "content-type": "application/json" },
      status: 404,
    });
  }
  
  const vehicle = vehicleResult.results[0];
  const enhancedVehicle = {
    ...vehicle,
    formatted_price: formatPrice(vehicle.base_price)
  };
  
  // Add variants if requested
  if (includeVariants) {
    const variantsStmt = env.DB.prepare(`
      SELECT * FROM variants WHERE model_id = ?
    `);
    const variantsResult = await variantsStmt.bind(vehicle.id).all();
    enhancedVehicle.variants = (variantsResult.results || []).map(v => ({
      ...v,
      is_default: Boolean(v.is_default)
    }));
  }
  
  // Add colors if requested
  if (includeColors) {
    const colorsStmt = env.DB.prepare(`
      SELECT * FROM colors WHERE model_id = ?
    `);
    const colorsResult = await colorsStmt.bind(vehicle.id).all();
    enhancedVehicle.colors = (colorsResult.results || []).map(c => ({
      ...c,
      is_default: Boolean(c.is_default)
    }));
  }
  
  // Add components if requested
  if (includeComponents) {
    const componentsStmt = env.DB.prepare(`
      SELECT * FROM components WHERE model_id = ?
    `);
    const componentsResult = await componentsStmt.bind(vehicle.id).all();
    enhancedVehicle.components = (componentsResult.results || []).map(c => ({
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

async function getPricing(params, env) {
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
  
  // Get the vehicle ID from model_code
  const vehicleStmt = env.DB.prepare(`
    SELECT id FROM models WHERE id = ? OR model_code = ?
  `);
  
  const vehicleResult = await vehicleStmt.bind(vehicleId, vehicleId).all();
  
  if (!vehicleResult.results || vehicleResult.results.length === 0) {
    return new Response(JSON.stringify({
      status: "error",
      message: "Vehicle not found"
    }), {
      headers: { "content-type": "application/json" },
      status: 404,
    });
  }
  
  const modelId = vehicleResult.results[0].id;
  
  // Get base pricing
  let pricingQuery = `
    SELECT base_price, fulfillment_fee
    FROM pricing
    WHERE model_id = ? AND pincode_start IS NULL
  `;
  
  let pricingStmt = env.DB.prepare(pricingQuery);
  let pricingResult = await pricingStmt.bind(modelId).all();
  
  if (!pricingResult.results || pricingResult.results.length === 0) {
    return new Response(JSON.stringify({
      status: "error",
      message: "Pricing not found for this vehicle"
    }), {
      headers: { "content-type": "application/json" },
      status: 404,
    });
  }
  
  let pricing = pricingResult.results[0];
  let locationSpecific = false;
  
  // Check for location-specific pricing
  if (locationCode && /^\d{6}$/.test(locationCode)) {
    let locationQuery = `
      SELECT base_price, fulfillment_fee
      FROM pricing
      WHERE model_id = ? AND ? BETWEEN pincode_start AND pincode_end
    `;
    
    let locationStmt = env.DB.prepare(locationQuery);
    let locationResult = await locationStmt.bind(modelId, parseInt(locationCode)).all();
    
    if (locationResult.results && locationResult.results.length > 0) {
      pricing = locationResult.results[0];
      locationSpecific = true;
    }
  }
  
  // Get variant pricing
  const variantsStmt = env.DB.prepare(`
    SELECT code as variant_id, price_addition
    FROM variants
    WHERE model_id = ?
  `);
  
  const variantsResult = await variantsStmt.bind(modelId).all();
  const variants = variantsResult.results || [];
  
  const variantPricing = variants.map(v => {
    const totalPrice = pricing.base_price + v.price_addition + (pricing.fulfillment_fee || 0);
    return {
      variant_id: v.variant_id,
      price_addition: v.price_addition,
      formatted_price_addition: formatPrice(v.price_addition),
      total_price: totalPrice,
      formatted_total_price: formatPrice(totalPrice)
    };
  });
  
  const baseTotal = pricing.base_price + (pricing.fulfillment_fee || 0);
  
  return new Response(JSON.stringify({
    status: "success",
    data: {
      pricing: {
        vehicle_id: vehicleId,
        base_price: pricing.base_price,
        formatted_base_price: formatPrice(pricing.base_price),
        fulfillment_fee: pricing.fulfillment_fee || 0,
        formatted_fulfillment_fee: formatPrice(pricing.fulfillment_fee || 0),
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

async function getInsuranceOptions(params, env) {
  const vehicleId = params.get('vehicle_id');
  
  // Get tenures (hardcoded for now, but could come from database)
  const tenures = [
    { id: "1year", name: "01 Year", months: 12 },
    { id: "5years", name: "05 Years", months: 60 }
  ];
  
  // Get providers
  const providersStmt = env.DB.prepare(`
    SELECT id, name, logo_url FROM insurance_providers
  `);
  
  const providersResult = await providersStmt.all();
  const providers = providersResult.results || [];
  
  // Get insurance plans
  let plansQuery = `
    SELECT 
      ip.id, 
      ip.provider_id, 
      ip.plan_type, 
      ip.title, 
      ip.subtitle, 
      ip.description, 
      ip.price, 
      ip.is_required, 
      ip.tenure_months
    FROM insurance_plans ip
  `;
  
  if (vehicleId) {
    // Add vehicle-specific filtering logic here if needed
  }
  
  const plansStmt = env.DB.prepare(plansQuery);
  const plansResult = await plansStmt.all();
  const plans = plansResult.results || [];
  
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

async function getFinancingOptions(params, env) {
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
    // Get vehicle price
    const vehicleStmt = env.DB.prepare(`
      SELECT m.id, p.base_price
      FROM models m
      JOIN pricing p ON m.id = p.model_id AND p.pincode_start IS NULL
      WHERE m.id = ? OR m.model_code = ?
    `);
    
    const vehicleResult = await vehicleStmt.bind(vehicleId, vehicleId).all();
    
    if (!vehicleResult.results || vehicleResult.results.length === 0) {
      return new Response(JSON.stringify({
        status: "error",
        message: "Vehicle not found"
      }), {
        headers: { "content-type": "application/json" },
        status: 404,
      });
    }
    
    const modelId = vehicleResult.results[0].id;
    financingAmount = vehicleResult.results[0].base_price;
    
    // Add variant price if specified
    if (variantId) {
      const variantStmt = env.DB.prepare(`
        SELECT price_addition FROM variants 
        WHERE model_id = ? AND code = ?
      `);
      
      const variantResult = await variantStmt.bind(modelId, variantId).all();
      
      if (variantResult.results && variantResult.results.length > 0) {
        financingAmount += variantResult.results[0].price_addition;
      }
    }
  }
  
  // Get providers
  const providersStmt = env.DB.prepare(`
    SELECT id, name, logo_url FROM finance_providers
  `);
  
  const providersResult = await providersStmt.all();
  const providers = providersResult.results || [];
  
  // Get financing options
  const optionsStmt = env.DB.prepare(`
    SELECT 
      id, 
      provider_id, 
      name, 
      tenure_months, 
      interest_rate, 
      min_downpayment, 
      processing_fee
    FROM finance_options
  `);
  
  const optionsResult = await optionsStmt.all();
  let options = optionsResult.results || [];
  
  // Calculate EMI for each option
  options = options.map(option => {
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