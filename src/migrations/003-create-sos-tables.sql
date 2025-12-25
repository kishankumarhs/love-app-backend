-- Migration: Create SOS and emergency tables
CREATE TABLE IF NOT EXISTS sos_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    guest_phone VARCHAR,
    guest_name VARCHAR,
    emergency_type VARCHAR NOT NULL,
    description TEXT NOT NULL,
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    address VARCHAR,
    status VARCHAR DEFAULT 'pending',
    priority VARCHAR DEFAULT 'low',
    assigned_to VARCHAR,
    emergency_call_id VARCHAR,
    is_emergency_call_made BOOLEAN DEFAULT false,
    emergency_call_response VARCHAR,
    resolved_at TIMESTAMP,
    resolved_by VARCHAR,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    phone_number VARCHAR NOT NULL,
    type VARCHAR NOT NULL,
    location VARCHAR,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_sos_tickets_user ON sos_tickets(user_id);
CREATE INDEX idx_sos_tickets_guest_phone ON sos_tickets(guest_phone);
CREATE INDEX idx_sos_tickets_status ON sos_tickets(status);
CREATE INDEX idx_sos_tickets_priority ON sos_tickets(priority);
CREATE INDEX idx_sos_tickets_emergency_type ON sos_tickets(emergency_type);
CREATE INDEX idx_emergency_contacts_active ON emergency_contacts(is_active);
CREATE INDEX idx_emergency_contacts_priority ON emergency_contacts(priority);