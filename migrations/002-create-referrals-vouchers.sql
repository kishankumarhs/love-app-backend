-- Create referrals, vouchers, and related tables

-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seeker_id UUID NOT NULL REFERENCES users(id),
    service_id UUID REFERENCES services(id),
    campaign_id UUID REFERENCES campaigns(id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'no_show')),
    scheduled_at TIMESTAMP,
    fulfilled_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vouchers table
CREATE TABLE IF NOT EXISTS vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('amount', 'unit', 'access')),
    issuer_org_id UUID NOT NULL REFERENCES orgs(id),
    sponsor_partner_id UUID REFERENCES orgs(id),
    value DECIMAL(10,2),
    unit_label VARCHAR(100),
    valid_from TIMESTAMP NOT NULL,
    valid_to TIMESTAMP NOT NULL,
    usage_limit INTEGER DEFAULT 1,
    usage_count INTEGER DEFAULT 0,
    code VARCHAR(50) UNIQUE NOT NULL,
    qr_code TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_user_id UUID REFERENCES users(id),
    provider_org_id UUID REFERENCES orgs(id),
    campaign_id UUID REFERENCES campaigns(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    provider VARCHAR(20) NOT NULL CHECK (provider IN ('stripe', 'paypal')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    external_transaction_id VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seeker_id UUID REFERENCES users(id),
    org_id UUID NOT NULL REFERENCES orgs(id),
    rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    text TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Volunteers table
CREATE TABLE IF NOT EXISTS volunteers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    interests TEXT[],
    preferred_locations TEXT[],
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    before JSONB,
    after JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_referrals_seeker_status ON referrals(seeker_id, status);
CREATE INDEX IF NOT EXISTS idx_referrals_service ON referrals(service_id);
CREATE INDEX IF NOT EXISTS idx_referrals_campaign ON referrals(campaign_id);
CREATE INDEX IF NOT EXISTS idx_referrals_scheduled ON referrals(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_vouchers_issuer ON vouchers(issuer_org_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_sponsor ON vouchers(sponsor_partner_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_code ON vouchers(code);
CREATE INDEX IF NOT EXISTS idx_vouchers_validity ON vouchers(valid_from, valid_to);
CREATE INDEX IF NOT EXISTS idx_donations_donor ON donations(donor_user_id);
CREATE INDEX IF NOT EXISTS idx_donations_provider_org ON donations(provider_org_id);
CREATE INDEX IF NOT EXISTS idx_donations_campaign ON donations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_reviews_seeker ON reviews(seeker_id);
CREATE INDEX IF NOT EXISTS idx_reviews_org ON reviews(org_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_volunteers_user ON volunteers(user_id);
CREATE INDEX IF NOT EXISTS idx_volunteers_status ON volunteers(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);