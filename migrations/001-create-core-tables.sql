-- Create core tables for Love App MVP

-- Organizations table
CREATE TABLE IF NOT EXISTS orgs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kind VARCHAR(20) NOT NULL CHECK (kind IN ('provider', 'sponsor', 'partner')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    verified_at TIMESTAMP,
    trusted BOOLEAN DEFAULT FALSE,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role VARCHAR(20) NOT NULL CHECK (role IN ('seeker', 'provider_admin', 'provider_staff', 'admin', 'subadmin', 'volunteer')),
    org_id UUID REFERENCES orgs(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(100),
    lastName VARCHAR(100),
    phone VARCHAR(50),
    mfa BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    isEmailVerified BOOLEAN DEFAULT FALSE,
    emailVerificationToken VARCHAR(255),
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(5) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    custom_schema JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES orgs(id),
    category_id UUID NOT NULL REFERENCES categories(id),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    hours JSONB DEFAULT '{}',
    eligibility JSONB DEFAULT '{}',
    capacity JSONB DEFAULT '{}',
    visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'restricted')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES orgs(id),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    start_at TIMESTAMP NOT NULL,
    end_at TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
    visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'restricted')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campaign locations table
CREATE TABLE IF NOT EXISTS campaign_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id),
    address TEXT NOT NULL,
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    hours JSONB DEFAULT '{}',
    capacity JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orgs_kind_status ON orgs(kind, status);
CREATE INDEX IF NOT EXISTS idx_orgs_verified_at ON orgs(verified_at);
CREATE INDEX IF NOT EXISTS idx_users_role_status ON users(role, status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_services_org_status ON services(org_id, status);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_location ON services(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_campaigns_org_status ON campaigns(org_id, status);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON campaigns(start_at, end_at);
CREATE INDEX IF NOT EXISTS idx_campaign_locations_campaign ON campaign_locations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_locations_location ON campaign_locations(latitude, longitude);