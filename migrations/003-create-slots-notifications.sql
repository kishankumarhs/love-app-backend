-- Create slots, notifications, and connectivity tables

-- Slot policies table
CREATE TABLE IF NOT EXISTS slot_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES services(id),
    campaign_id UUID REFERENCES campaigns(id),
    slot_size INTEGER DEFAULT 30,
    max_per_slot INTEGER DEFAULT 10,
    operating_hours JSONB DEFAULT '{}',
    booking_lead_time INTEGER DEFAULT 60,
    cancel_cutoff INTEGER DEFAULT 30,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Slots table
CREATE TABLE IF NOT EXISTS slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES services(id),
    campaign_id UUID REFERENCES campaigns(id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    current_bookings INTEGER DEFAULT 0,
    max_capacity INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'booked', 'blocked')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notification templates table
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('email', 'sms', 'push')),
    category VARCHAR(20) NOT NULL CHECK (category IN ('sos', 'referral', 'donation', 'volunteer', 'system')),
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    variables TEXT[],
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES users(id),
    template_id UUID NOT NULL REFERENCES notification_templates(id),
    type VARCHAR(20) NOT NULL CHECK (type IN ('email', 'sms', 'push')),
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    recipient_email VARCHAR(255),
    recipient_phone VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'delivered')),
    external_id VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- WiFi tokens table
CREATE TABLE IF NOT EXISTS wifi_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token VARCHAR(50) UNIQUE NOT NULL,
    ttl INTEGER DEFAULT 3600,
    expires_at TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired')),
    used_at TIMESTAMP,
    user_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_slot_policies_service ON slot_policies(service_id);
CREATE INDEX IF NOT EXISTS idx_slot_policies_campaign ON slot_policies(campaign_id);
CREATE INDEX IF NOT EXISTS idx_slots_service_time ON slots(service_id, start_time);
CREATE INDEX IF NOT EXISTS idx_slots_campaign_time ON slots(campaign_id, start_time);
CREATE INDEX IF NOT EXISTS idx_slots_time_range ON slots(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_notification_templates_type_category ON notification_templates(type, category);
CREATE INDEX IF NOT EXISTS idx_notification_templates_key ON notification_templates(key);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_status ON notifications(recipient_id, status);
CREATE INDEX IF NOT EXISTS idx_notifications_template ON notifications(template_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_wifi_tokens_token ON wifi_tokens(token);
CREATE INDEX IF NOT EXISTS idx_wifi_tokens_expires ON wifi_tokens(expires_at);