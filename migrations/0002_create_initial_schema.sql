-- Migration: Create all tables as per schema

CREATE TABLE IF NOT EXISTS colors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_id INTEGER,
    name VARCHAR NOT NULL,
    color_value VARCHAR NOT NULL,
    is_default BOOLEAN,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS components (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_id INTEGER,
    component_type VARCHAR NOT NULL,
    code VARCHAR NOT NULL,
    title VARCHAR NOT NULL,
    subtitle VARCHAR,
    description TEXT,
    price INTEGER NOT NULL,
    is_required BOOLEAN,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS finance_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider_id INTEGER,
    name VARCHAR NOT NULL,
    tenure_months INTEGER NOT NULL,
    interest_rate NUMERIC NOT NULL,
    min_downpayment INTEGER NOT NULL,
    processing_fee INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS finance_providers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR NOT NULL,
    logo_url VARCHAR,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS insurance_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider_id INTEGER,
    plan_type VARCHAR NOT NULL,
    title VARCHAR NOT NULL,
    subtitle VARCHAR,
    description TEXT,
    price INTEGER NOT NULL,
    is_required BOOLEAN,
    tenure_months INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS insurance_providers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR NOT NULL,
    logo_url VARCHAR,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS models (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_code VARCHAR NOT NULL,
    name VARCHAR NOT NULL,
    description TEXT,
    image_url VARCHAR,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS pricing (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_id INTEGER,
    state VARCHAR,
    city VARCHAR,
    pincode_start INTEGER,
    pincode_end INTEGER,
    base_price INTEGER NOT NULL,
    fulfillment_fee INTEGER,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS variants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_id INTEGER,
    code VARCHAR NOT NULL,
    title VARCHAR NOT NULL,
    subtitle VARCHAR,
    description TEXT,
    price_addition INTEGER NOT NULL,
    battery_capacity VARCHAR,
    range_km INTEGER,
    is_default BOOLEAN,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);
