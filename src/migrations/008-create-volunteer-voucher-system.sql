-- Migration 008: Create volunteer enhancements and Wi-Fi voucher system

-- Update volunteers table with location preferences
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS location_preferences JSONB DEFAULT '{}'::jsonb;
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended'));
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected'));
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS background_check_status VARCHAR(20) DEFAULT 'not_required' CHECK (background_check_status IN ('not_required', 'pending', 'approved', 'rejected'));

-- Create volunteer_applications table
CREATE TABLE IF NOT EXISTS volunteer_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    interests TEXT[] DEFAULT '{}',
    skills TEXT[] DEFAULT '{}',
    availability VARCHAR(255),
    location_preferences JSONB DEFAULT '{}'::jsonb,
    motivation TEXT,
    experience TEXT,
    references JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create wifi_vouchers table
CREATE TABLE IF NOT EXISTS wifi_vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired', 'revoked')),
    duration_hours INTEGER NOT NULL DEFAULT 24,
    bandwidth_limit_mb INTEGER,
    max_devices INTEGER DEFAULT 1,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    activated_at TIMESTAMP WITH TIME ZONE,
    used_at TIMESTAMP WITH TIME ZONE,
    device_info JSONB DEFAULT '{}'::jsonb,
    usage_stats JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create voucher_usage_logs table
CREATE TABLE IF NOT EXISTS voucher_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voucher_id UUID NOT NULL REFERENCES wifi_vouchers(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('created', 'activated', 'used', 'expired', 'revoked', 'bandwidth_exceeded')),
    device_mac VARCHAR(17),
    device_info JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    data_used_mb DECIMAL(10,2),
    session_duration_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create volunteer_assignments table
CREATE TABLE IF NOT EXISTS volunteer_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    volunteer_id UUID NOT NULL REFERENCES volunteers(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
    assignment_type VARCHAR(50) NOT NULL CHECK (assignment_type IN ('campaign_support', 'emergency_response', 'community_outreach', 'technical_support')),
    status VARCHAR(20) DEFAULT 'assigned' CHECK (status IN ('assigned', 'accepted', 'declined', 'completed', 'cancelled')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    description TEXT,
    location JSONB DEFAULT '{}'::jsonb,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    feedback TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_volunteer_applications_user_id ON volunteer_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_applications_status ON volunteer_applications(status);

CREATE INDEX IF NOT EXISTS idx_wifi_vouchers_code ON wifi_vouchers(code);
CREATE INDEX IF NOT EXISTS idx_wifi_vouchers_provider_id ON wifi_vouchers(provider_id);
CREATE INDEX IF NOT EXISTS idx_wifi_vouchers_status ON wifi_vouchers(status);
CREATE INDEX IF NOT EXISTS idx_wifi_vouchers_expires_at ON wifi_vouchers(expires_at);
CREATE INDEX IF NOT EXISTS idx_wifi_vouchers_user_id ON wifi_vouchers(user_id);

CREATE INDEX IF NOT EXISTS idx_voucher_usage_logs_voucher_id ON voucher_usage_logs(voucher_id);
CREATE INDEX IF NOT EXISTS idx_voucher_usage_logs_event_type ON voucher_usage_logs(event_type);

CREATE INDEX IF NOT EXISTS idx_volunteer_assignments_volunteer_id ON volunteer_assignments(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_assignments_status ON volunteer_assignments(status);
CREATE INDEX IF NOT EXISTS idx_volunteer_assignments_scheduled_at ON volunteer_assignments(scheduled_at);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_volunteer_applications_updated_at BEFORE UPDATE ON volunteer_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wifi_vouchers_updated_at BEFORE UPDATE ON wifi_vouchers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_volunteer_assignments_updated_at BEFORE UPDATE ON volunteer_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();