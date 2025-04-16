-- Migration number: 0003     2025-04-16T12:00:00.000Z

-- Insert models
INSERT INTO models (model_code, name, description, image_url, created_at, updated_at)
VALUES
    ('B10', 'KM3000 Mark 2', 'Your favourite fully faired sports bike', 'https://www.kabiramobility.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('B20', 'KM4000 Mark 2', 'Your favourite silent warrior', 'https://www.kabiramobility.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('B50', 'KM5000', 'Longest Range Cruiser Bike', 'https://www.kabiramobility.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('H10', 'HERMES 75 Mark 2', 'Your favourite business companion', 'https://www.kabiramobility.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('N10', 'INTERCITY 350', 'Your only favourite scooter', 'https://www.kabiramobility.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert finance_providers
INSERT INTO finance_providers (name, logo_url, created_at, updated_at)
VALUES
    ('ICICI BANK', 'https://www.kabiramobility.com/images/providers/icici_bank.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('PUNJAB NATIONAL BANK', 'https://www.kabiramobility.com/images/providers/pnb.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('IDFC FIRST BANK', 'https://www.kabiramobility.com/images/providers/idfc_first.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert insurance_providers
INSERT INTO insurance_providers (name, logo_url, created_at, updated_at)
VALUES
    ('DIGIT', 'https://www.kabiramobility.com/images/providers/digit.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ICICI LOMBARD', 'https://www.kabiramobility.com/images/providers/icici_lombard.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('TURTLEMINT', 'https://www.kabiramobility.com/images/providers/turtlemint.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('BAJAJ ALLIANZ', 'https://www.kabiramobility.com/images/providers/bajaj_allianz.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- For variants, we need to get model_id values first
-- Insert variants
INSERT INTO variants (model_id, code, title, subtitle, description, price_addition, battery_capacity, range_km, is_default, created_at, updated_at)
SELECT
    id as model_id,
    'B10-LONG-RANGE',
    'LONG RANGE',
    '5.14 kWh Battery Pack',
    '202 kms Range (IDC)',
    999,
    '5.14',
    202,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM models WHERE model_code = 'B10';

INSERT INTO variants (model_id, code, title, subtitle, description, price_addition, battery_capacity, range_km, is_default, created_at, updated_at)
SELECT
    id as model_id,
    'B10-STANDARD-RANGE',
    'STANDARD RANGE',
    '4.14 kWh Battery Pack',
    '148 kms Range (IDC)',
    0,
    '4.14',
    148,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM models WHERE model_code = 'B10';

INSERT INTO variants (model_id, code, title, subtitle, description, price_addition, battery_capacity, range_km, is_default, created_at, updated_at)
SELECT
    id as model_id,
    'B20-LONG-RANGE',
    'LONG RANGE',
    '5.14 kWh Battery Pack',
    '202 kms Range (IDC)',
    999,
    '5.14',
    202,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM models WHERE model_code = 'B20';

INSERT INTO variants (model_id, code, title, subtitle, description, price_addition, battery_capacity, range_km, is_default, created_at, updated_at)
SELECT
    id as model_id,
    'B20-STANDARD-RANGE',
    'STANDARD RANGE',
    '4.14 kWh Battery Pack',
    '148 kms Range (IDC)',
    0,
    '4.14',
    148,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM models WHERE model_code = 'B20';

INSERT INTO variants (model_id, code, title, subtitle, description, price_addition, battery_capacity, range_km, is_default, created_at, updated_at)
SELECT
    id as model_id,
    'B50-LONG-RANGE',
    'LONG RANGE',
    '18.12 kWh Battery Pack',
    'High endurance for long trips',
    999,
    '18.12',
    350,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM models WHERE model_code = 'B50';

INSERT INTO variants (model_id, code, title, subtitle, description, price_addition, battery_capacity, range_km, is_default, created_at, updated_at)
SELECT
    id as model_id,
    'B50-STANDARD-RANGE',
    'STANDARD RANGE',
    '8.45 kWh Battery Pack',
    'Optimal balance of range and weight',
    0,
    '8.45',
    180,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM models WHERE model_code = 'B50';

INSERT INTO variants (model_id, code, title, subtitle, description, price_addition, battery_capacity, range_km, is_default, created_at, updated_at)
SELECT
    id as model_id,
    'H10-LONG-RANGE',
    'LONG RANGE',
    '4.28 kWh Battery Pack',
    '210 kms Range (IDC)',
    999,
    '4.28',
    210,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM models WHERE model_code = 'H10';

INSERT INTO variants (model_id, code, title, subtitle, description, price_addition, battery_capacity, range_km, is_default, created_at, updated_at)
SELECT
    id as model_id,
    'H10-STANDARD-RANGE',
    'STANDARD RANGE',
    '3.35 kWh Battery Pack',
    '151 kms Range (IDC)',
    0,
    '3.35',
    151,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM models WHERE model_code = 'H10';

INSERT INTO variants (model_id, code, title, subtitle, description, price_addition, battery_capacity, range_km, is_default, created_at, updated_at)
SELECT
    id as model_id,
    'N10-LONG-RANGE',
    'LONG RANGE',
    '4.28 kWh Battery Pack',
    '210 kms Range (IDC)',
    999,
    '4.28',
    210,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM models WHERE model_code = 'N10';

INSERT INTO variants (model_id, code, title, subtitle, description, price_addition, battery_capacity, range_km, is_default, created_at, updated_at)
SELECT
    id as model_id,
    'N10-STANDARD-RANGE',
    'STANDARD RANGE',
    '3.35 kWh Battery Pack',
    '151 kms Range (IDC)',
    0,
    '3.35',
    151,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM models WHERE model_code = 'N10';

-- Insert colors
INSERT INTO colors (model_id, name, color_value, is_default, created_at, updated_at)
SELECT
    id as model_id,
    'GLOSSY RED',
    '#FF1616',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM models WHERE model_code = 'B10';

INSERT INTO colors (model_id, name, color_value, is_default, created_at, updated_at)
SELECT
    id as model_id,
    'MATTE BLACK',
    '#252525',
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM models WHERE model_code = 'B10';

INSERT INTO colors (model_id, name, color_value, is_default, created_at, updated_at)
SELECT
    id as model_id,
    'GLOSSY RED',
    '#FF1616',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM models WHERE model_code = 'B20';

INSERT INTO colors (model_id, name, color_value, is_default, created_at, updated_at)
SELECT
    id as model_id,
    'MATTE BLACK',
    '#252525',
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM models WHERE model_code = 'B20';

INSERT INTO colors (model_id, name, color_value, is_default, created_at, updated_at)
SELECT
    id as model_id,
    'ALUMINIUM',
    '#727272',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM models WHERE model_code = 'B50';

INSERT INTO colors (model_id, name, color_value, is_default, created_at, updated_at)
SELECT
    id as model_id,
    'JUST WHITE',
    '#EEEEEE',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM models WHERE model_code = 'H10';

INSERT INTO colors (model_id, name, color_value, is_default, created_at, updated_at)
SELECT
    id as model_id,
    'JUST WHITE',
    '#EEEEEE',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM models WHERE model_code = 'N10';

-- Insert components for B10
INSERT INTO components (model_id, component_type, code, title, subtitle, description, price, is_required, created_at, updated_at)
SELECT
    id as model_id,
    'ACCESSORY',
    'B10-HELMET',
    'HELMET',
    'Mandatory Accessory',
    'Protective headgear for rider safety',
    999,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM models WHERE model_code = 'B10';

INSERT INTO components (model_id, component_type, code, title, subtitle, description, price, is_required, created_at, updated_at)
SELECT
    id as model_id,
    'ACCESSORY',
    'B10-SAREE-GUARD',
    'SAREE GUARD',
    'Mandatory Accessory',
    'Safety attachment for traditional clothing',
    999,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM models WHERE model_code = 'B10';

INSERT INTO components (model_id, component_type, code, title, subtitle, description, price, is_required, created_at, updated_at)
SELECT
    id as model_id,
    'PACKAGE',
    'B10-SMART-CONNECTIVITY-PACKAGE',
    'SMART CONNECTIVITY PACKAGE',
    'Smart AI Connectivity for 3 Yrs',
    'Advanced connectivity features for smartphone integration',
    999,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM models WHERE model_code = 'B10';

INSERT INTO components (model_id, component_type, code, title, subtitle, description, price, is_required, created_at, updated_at)
SELECT
    id as model_id,
    'PACKAGE',
    'B10-OFF-ROAD-PACKAGE',
    'OFF-ROAD PACKAGE',
    'Off Road Accessories',
    'Rugged accessories for off-road adventures',
    999,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM models WHERE model_code = 'B10';

-- Insert components for B20
INSERT INTO components (model_id, component_type, code, title, subtitle, description, price, is_required, created_at, updated_at)
SELECT
    id as model_id,
    'ACCESSORY',
    'B20-HELMET',
    'HELMET',
    'Mandatory Accessory',
    'Protective headgear for rider safety',
    999,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM models WHERE model_code = 'B20';

INSERT INTO components (model_id, component_type, code, title, subtitle, description, price, is_required, created_at, updated_at)
SELECT
    id as model_id,
    'ACCESSORY',
    'B20-SAREE-GUARD',
    'SAREE GUARD',
    'Mandatory Accessory',
    'Safety attachment for traditional clothing',
    999,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM models WHERE model_code = 'B20';

INSERT INTO components (model_id, component_type, code, title, subtitle, description, price, is_required, created_at, updated_at)
SELECT
    id as model_id,
    'PACKAGE',
    'B20-SMART-CONNECTIVITY-PACKAGE',
    'SMART CONNECTIVITY PACKAGE',
    'Smart AI Connectivity for 3 Yrs',
    'Advanced connectivity features for smartphone integration',
    999,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM models WHERE model_code = 'B20';

INSERT INTO components (model_id, component_type, code, title, subtitle, description, price, is_required, created_at, updated_at)
SELECT
    id as model_id,
    'PACKAGE',
    'B20-OFF-ROAD-PACKAGE',
    'OFF-ROAD PACKAGE',
    'Off Road Accessories',
    'Rugged accessories for off-road adventures',
    999,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM models WHERE model_code = 'B20';

-- Insert components for B50
INSERT INTO components (model_id, component_type, code, title, subtitle, description, price, is_required, created_at, updated_at)
SELECT
    id as model_id,
    'ACCESSORY',
    'B50-SAREE-GUARD',
    'SAREE GUARD',
    'Mandatory Accessory',
    'Safety attachment for traditional clothing',
    999,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM models WHERE model_code = 'B50';

INSERT INTO components (model_id, component_type, code, title, subtitle, description, price, is_required, created_at, updated_at)
SELECT
    id as model_id,
    'ACCESSORY',
    'B50-CRASH-GUARD',
    'CRASH GUARD',
    'Protect your scooter from accidental fall',
    'Durable guards to minimize damage in case of falls',
    999,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM models WHERE model_code = 'B50';

INSERT INTO components (model_id, component_type, code, title, subtitle, description, price, is_required, created_at, updated_at)
SELECT
    id as model_id,
    'PACKAGE',
    'B50-SMART-CONNECTIVITY-PACKAGE',
    'SMART CONNECTIVITY PACKAGE',
    'Smart AI Connectivity for 3 Yrs',
    'Advanced connectivity features for smartphone integration',
    999,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM models WHERE model_code = 'B50';

INSERT INTO components (model_id, component_type, code, title, subtitle, description, price, is_required, created_at, updated_at)
SELECT
    id as model_id,
    'PACKAGE',
    'B50-PERFORMANCE-PACKAGE',
    'PERFORMANCE PACKAGE',
    'Upgrade your scooter performance',
    'Enhanced speed and acceleration components',
    999,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM models WHERE model_code = 'B50';

-- Insert common components (warranty, service)
INSERT INTO components (model_id, component_type, code, title, subtitle, description, price, is_required, created_at, updated_at)
VALUES
    (NULL, 'WARRANTY', 'COMMON-STANDARD', 'Standard', 'Standard warranty included', 'Basic warranty coverage for your vehicle', 0, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (NULL, 'WARRANTY', 'COMMON-EXTENDED-2Y', '+02 Years Extended', '05 Years / 60,000kms', 'Extended warranty for additional peace of mind', 15500, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (NULL, 'WARRANTY', 'COMMON-EXTENDED-5Y', '+05 Years Extended', '08 Years / 1,00,000kms', 'Maximum warranty protection for long-term ownership', 21900, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (NULL, 'SERVICE', 'COMMON-FIRST-YEAR', 'First Year', '03 Free Service with 0 Labour Charge', 'Complimentary first-year maintenance package', 0, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (NULL, 'SERVICE', 'COMMON-CARE-PLUS', 'KM Care+', '02 Service + 01 Inspection Camp', 'Premium care package with additional service benefits', 1999, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert finance_options
INSERT INTO finance_options (provider_id, name, tenure_months, interest_rate, min_downpayment, processing_fee, created_at, updated_at)
SELECT
    id as provider_id,
    'Easy EMI Plan',
    12,
    9.99,
    10000,
    999,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM finance_providers WHERE name = 'ICICI BANK';

INSERT INTO finance_options (provider_id, name, tenure_months, interest_rate, min_downpayment, processing_fee, created_at, updated_at)
SELECT
    id as provider_id,
    'Standard Loan',
    24,
    10.50,
    15000,
    1499,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM finance_providers WHERE name = 'ICICI BANK';

INSERT INTO finance_options (provider_id, name, tenure_months, interest_rate, min_downpayment, processing_fee, created_at, updated_at)
SELECT
    id as provider_id,
    'Zero Interest',
    6,
    0.00,
    50000,
    2999,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM finance_providers WHERE name = 'ICICI BANK';

INSERT INTO finance_options (provider_id, name, tenure_months, interest_rate, min_downpayment, processing_fee, created_at, updated_at)
SELECT
    id as provider_id,
    'Affordable EMI',
    12,
    11.50,
    10000,
    999,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM finance_providers WHERE name = 'PUNJAB NATIONAL BANK';

INSERT INTO finance_options (provider_id, name, tenure_months, interest_rate, min_downpayment, processing_fee, created_at, updated_at)
SELECT
    id as provider_id,
    'Long Term Loan',
    36,
    12.25,
    20000,
    1999,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM finance_providers WHERE name = 'PUNJAB NATIONAL BANK';

INSERT INTO finance_options (provider_id, name, tenure_months, interest_rate, min_downpayment, processing_fee, created_at, updated_at)
SELECT
    id as provider_id,
    'Quick Approval',
    12,
    10.75,
    10000,
    1499,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM finance_providers WHERE name = 'IDFC FIRST BANK';

INSERT INTO finance_options (provider_id, name, tenure_months, interest_rate, min_downpayment, processing_fee, created_at, updated_at)
SELECT
    id as provider_id,
    'Low Interest',
    24,
    9.50,
    25000,
    2499,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM finance_providers WHERE name = 'IDFC FIRST BANK';

-- Insert insurance_plans
INSERT INTO insurance_plans (provider_id, plan_type, title, subtitle, description, price, is_required, tenure_months, created_at, updated_at)
SELECT
    id as provider_id,
    'CORE',
    'BASE INSURANCE',
    'STANDARD LINE FOR BASE INSURANCE',
    'Basic required insurance coverage',
    9942,
    1,
    12,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM insurance_providers WHERE name = 'TURTLEMINT';

INSERT INTO insurance_plans (provider_id, plan_type, title, subtitle, description, price, is_required, tenure_months, created_at, updated_at)
SELECT
    id as provider_id,
    'CORE',
    'PERSONAL ACCIDENT COVER',
    'STANDARD LINE FOR PERSONAL ACCIDENT COVER',
    'Coverage for personal injuries',
    9942,
    1,
    12,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM insurance_providers WHERE name = 'TURTLEMINT';

INSERT INTO insurance_plans (provider_id, plan_type, title, subtitle, description, price, is_required, tenure_months, created_at, updated_at)
SELECT
    id as provider_id,
    'CORE',
    'ZERO DEPRECIATION',
    'STANDARD LINE FOR ZERO DEPRECIATION',
    'Full value coverage without depreciation',
    9942,
    1,
    12,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM insurance_providers WHERE name = 'TURTLEMINT';

INSERT INTO insurance_plans (provider_id, plan_type, title, subtitle, description, price, is_required, tenure_months, created_at, updated_at)
SELECT
    id as provider_id,
    'CORE',
    'ROAD SIDE ASSISTANCE',
    'STANDARD LINE FOR ROAD SIDE ASSISTANCE',
    '24/7 help for roadside emergencies',
    9942,
    1,
    12,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM insurance_providers WHERE name = 'TURTLEMINT';

INSERT INTO insurance_plans (provider_id, plan_type, title, subtitle, description, price, is_required, tenure_months, created_at, updated_at)
SELECT
    id as provider_id,
    'ADDITIONAL',
    'RIM PROTECTION',
    'STANDARD LINE FOR RIM PROTECTION',
    'Coverage for wheel rim damage',
    9942,
    0,
    12,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM insurance_providers WHERE name = 'TURTLEMINT';

INSERT INTO insurance_plans (provider_id, plan_type, title, subtitle, description, price, is_required, tenure_months, created_at, updated_at)
SELECT
    id as provider_id,
    'ADDITIONAL',
    'RODENT PROTECTION',
    'STANDARD LINE FOR RODENT PROTECTION',
    'Coverage for rodent damage to wiring',
    9942,
    0,
    12,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM insurance_providers WHERE name = 'TURTLEMINT';

INSERT INTO insurance_plans (provider_id, plan_type, title, subtitle, description, price, is_required, tenure_months, created_at, updated_at)
SELECT
    id as provider_id,
    'CORE',
    'BASE INSURANCE',
    'STANDARD LINE FOR BASE INSURANCE',
    'Extended multi-year basic coverage',
    19884,
    1,
    60,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM insurance_providers WHERE name = 'TURTLEMINT';

INSERT INTO insurance_plans (provider_id, plan_type, title, subtitle, description, price, is_required, tenure_months, created_at, updated_at)
SELECT
    id as provider_id,
    'CORE',
    'PERSONAL ACCIDENT COVER',
    'STANDARD LINE FOR PERSONAL ACCIDENT COVER',
    'Long-term personal injury protection',
    19884,
    1,
    60,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM insurance_providers WHERE name = 'TURTLEMINT';

INSERT INTO insurance_plans (provider_id, plan_type, title, subtitle, description, price, is_required, tenure_months, created_at, updated_at)
SELECT
    id as provider_id,
    'CORE',
    'ZERO DEPRECIATION',
    'STANDARD LINE FOR ZERO DEPRECIATION',
    'Multi-year zero depreciation coverage',
    19884,
    1,
    60,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM insurance_providers WHERE name = 'TURTLEMINT';

INSERT INTO insurance_plans (provider_id, plan_type, title, subtitle, description, price, is_required, tenure_months, created_at, updated_at)
SELECT
    id as provider_id,
    'ADDITIONAL',
    'RETURN TO INVOICE',
    'STANDARD LINE FOR RETURN TO INVOICE',
    'Full invoice value in case of total loss',
    9942,
    0,
    12,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM insurance_providers WHERE name = 'TURTLEMINT';

INSERT INTO insurance_plans (provider_id, plan_type, title, subtitle, description, price, is_required, tenure_months, created_at, updated_at)
SELECT
    id as provider_id,
    'CORE',
    'COMPREHENSIVE COVER',
    'Complete protection for your vehicle',
    'All-inclusive protection plan',
    8950,
    1,
    12,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM insurance_providers WHERE name = 'ICICI LOMBARD';

INSERT INTO insurance_plans (provider_id, plan_type, title, subtitle, description, price, is_required, tenure_months, created_at, updated_at)
SELECT
    id as provider_id,
    'CORE',
    'ALL-INCLUSIVE PLAN',
    'Protection from all damages and accidents',
    'Comprehensive coverage with additional benefits',
    10500,
    1,
    12,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM insurance_providers WHERE name = 'BAJAJ ALLIANZ';

INSERT INTO insurance_plans (provider_id, plan_type, title, subtitle, description, price, is_required, tenure_months, created_at, updated_at)
SELECT
    id as provider_id,
    'CORE',
    'STANDARD COVERAGE',
    'Basic coverage with essential benefits',
    'Fundamental protection with key features',
    9500,
    1,
    12,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM insurance_providers WHERE name = 'DIGIT';

-- Insert pricing for B10
INSERT INTO pricing (model_id, state, city, pincode_start, pincode_end, base_price, fulfillment_fee, created_at, updated_at)
SELECT
    id as model_id,
    'Andhra Pradesh',
    NULL,
    500000,
    539999,
    172500,
    1250,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM models WHERE model_code = 'B10';

INSERT INTO pricing (model_id, state, city, pincode_start, pincode_end, base_price, fulfillment_fee, created_at, updated_at)
SELECT
    id as model_id,
    'Arunachal Pradesh',
    NULL,
    790000,
    792999,
    172500,
    1250,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM models WHERE model_code = 'B10';

INSERT INTO pricing (model_id, state, city, pincode_start, pincode_end, base_price, fulfillment_fee, created_at, updated_at)
SELECT
    id as model_id,
    'Assam',
    NULL,
    780000,
    788999,
    172500,
    1250,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM models WHERE model_code = 'B10';

INSERT INTO pricing (model_id, state, city, pincode_start, pincode_end, base_price, fulfillment_fee, created_at, updated_at)
SELECT
    id as model_id,
    'Bihar',
    NULL,
    800000,
    855999,
    172500,
    1250,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM models WHERE model_code = 'B10';

INSERT INTO pricing (model_id, state, city, pincode_start, pincode_end, base_price, fulfillment_fee, created_at, updated_at)
SELECT
    id as model_id,
    'Chhattisgarh',
    NULL,
    490000,
    499999,
    172500,
    1250,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM models WHERE model_code = 'B10';

INSERT INTO pricing (model_id, state, city, pincode_start, pincode_end, base_price, fulfillment_fee, created_at, updated_at)
SELECT
    id as model_id,
    'Goa',
    NULL,
    403000,
    403999,
    172500,
    1250,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM models WHERE model_code = 'B10';

INSERT INTO pricing (model_id, state, city, pincode_start, pincode_end, base_price, fulfillment_fee, created_at, updated_at)
SELECT
    id as model_id,
    'Gujarat',
    NULL,
    360000,
    396999,
    172500,
    1250,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM models WHERE model_code = 'B10';

INSERT INTO pricing (model_id, state, city, pincode_start, pincode_end, base_price, fulfillment_fee, created_at, updated_at)
SELECT
    id as model_id,
    'Delhi',
    NULL,
    110000,
    110099,
    172500,
    1250,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM models WHERE model_code = 'B10';

-- Insert pricing for B20
INSERT INTO pricing (model_id, state, city, pincode_start, pincode_end, base_price, fulfillment_fee, created_at, updated_at)
SELECT
    id as model_id,
    'Andhra Pradesh',
    NULL,
    500000,
    539999,
    166500,
    2500,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM models WHERE model_code = 'B20';

INSERT INTO pricing (model_id, state, city, pincode_start, pincode_end, base_price, fulfillment_fee, created_at, updated_at)
SELECT
    id as model_id,
    'Arunachal Pradesh',
    NULL,
    790000,
    792999,
    166500,
    2500,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM models WHERE model_code = 'B20';

INSERT INTO pricing (model_id, state, city, pincode_start, pincode_end, base_price, fulfillment_fee, created_at, updated_at)
SELECT
    id as model_id,
    'Assam',
    NULL,
    780000,
    788999,
    166500,
    2500,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM models WHERE model_code = 'B20';

INSERT INTO pricing (model_id, state, city, pincode_start, pincode_end, base_price, fulfillment_fee, created_at, updated_at)
SELECT
    id as model_id,
    'Bihar',
    NULL,
    800000,
    855999,
    166500,
    2500,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM models WHERE model_code = 'B20';

INSERT INTO pricing (model_id, state, city, pincode_start, pincode_end, base_price, fulfillment_fee, created_at, updated_at)
SELECT
    id as model_id,
    'Delhi',
    NULL,
    110000,
    110099,
    166500,
    2500,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM models WHERE model_code = 'B20';

-- Insert pricing for B50, H10, and N10
INSERT INTO pricing (model_id, state, city, pincode_start, pincode_end, base_price, fulfillment_fee, created_at, updated_at)
SELECT
    id as model_id,
    'Delhi',
    NULL,
    110000,
    110099,
    195000,
    2500,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM models WHERE model_code = 'B50';

INSERT INTO pricing (model_id, state, city, pincode_start, pincode_end, base_price, fulfillment_fee, created_at, updated_at)
SELECT
    id as model_id,
    'Delhi',
    NULL,
    110000,
    110099,
    155500,
    1500,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM models WHERE model_code = 'H10';

INSERT INTO pricing (model_id, state, city, pincode_start, pincode_end, base_price, fulfillment_fee, created_at, updated_at)
SELECT
    id as model_id,
    'Delhi',
    NULL,
    110000,
    110099,
    145000,
    1500,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM models WHERE model_code = 'N10';
