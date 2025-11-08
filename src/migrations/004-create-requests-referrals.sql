-- Migration: Create requests and referrals tables
CREATE TABLE IF NOT EXISTS requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title VARCHAR NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR NOT NULL,
    urgency VARCHAR NOT NULL,
    status VARCHAR DEFAULT 'pending',
    provider_id UUID,
    assigned_to UUID,
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    address VARCHAR,
    preferred_contact_method VARCHAR,
    notes TEXT,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL,
    provider_id UUID NOT NULL,
    referred_by UUID NOT NULL,
    status VARCHAR DEFAULT 'pending',
    notes TEXT,
    contacted_at TIMESTAMP,
    response_received BOOLEAN,
    provider_response TEXT,
    appointment_date TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
    FOREIGN KEY (referred_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_requests_user ON requests(user_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_category ON requests(category);
CREATE INDEX idx_requests_urgency ON requests(urgency);
CREATE INDEX idx_requests_provider ON requests(provider_id);
CREATE INDEX idx_referrals_request ON referrals(request_id);
CREATE INDEX idx_referrals_provider ON referrals(provider_id);
CREATE INDEX idx_referrals_status ON referrals(status);
CREATE INDEX idx_referrals_referred_by ON referrals(referred_by);