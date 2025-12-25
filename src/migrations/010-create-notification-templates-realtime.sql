-- Migration 010: Create notification templates and real-time updates

-- Update notifications table with template and real-time fields
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS template_id UUID;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS template_data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS failed_reason TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent'));
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'general' CHECK (category IN ('general', 'sos', 'campaign', 'donation', 'volunteer', 'system'));

-- Create notification_templates table
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('email', 'sms', 'push')),
    category VARCHAR(50) NOT NULL CHECK (category IN ('general', 'sos', 'campaign', 'donation', 'volunteer', 'system')),
    subject VARCHAR(500),
    template_content TEXT NOT NULL,
    variables JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create websocket_connections table for tracking active connections
CREATE TABLE IF NOT EXISTS websocket_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    socket_id VARCHAR(255) NOT NULL,
    room VARCHAR(255),
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT,
    ip_address INET
);

-- Create real_time_events table for event tracking
CREATE TABLE IF NOT EXISTS real_time_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('sos_created', 'sos_updated', 'notification_sent', 'campaign_updated', 'donation_received')),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    room VARCHAR(255),
    payload JSONB DEFAULT '{}'::jsonb,
    sent_to_users UUID[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create notification_delivery_log table
CREATE TABLE IF NOT EXISTS notification_delivery_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    delivery_method VARCHAR(20) NOT NULL CHECK (delivery_method IN ('email', 'sms', 'push', 'websocket')),
    recipient VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
    provider_response JSONB,
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default notification templates
INSERT INTO notification_templates (name, type, category, subject, template_content, variables) VALUES
('sos_alert_email', 'email', 'sos', 'Emergency Alert - {{location}}', 
 '<h2>Emergency Alert</h2><p>An emergency has been reported at {{location}}.</p><p><strong>Type:</strong> {{emergencyType}}</p><p><strong>Description:</strong> {{description}}</p><p><strong>Time:</strong> {{timestamp}}</p>', 
 '["location", "emergencyType", "description", "timestamp"]'),

('sos_alert_sms', 'sms', 'sos', '', 
 'EMERGENCY ALERT: {{emergencyType}} reported at {{location}}. Time: {{timestamp}}. Please respond if you can assist.',
 '["location", "emergencyType", "timestamp"]'),

('campaign_donation_email', 'email', 'donation', 'Thank you for your donation to {{campaignTitle}}',
 '<h2>Thank you for your donation!</h2><p>Your donation of ${{amount}} to {{campaignTitle}} has been received.</p><p>Transaction ID: {{transactionId}}</p><p>Date: {{date}}</p>',
 '["campaignTitle", "amount", "transactionId", "date"]'),

('volunteer_assignment_email', 'email', 'volunteer', 'New Volunteer Assignment - {{assignmentType}}',
 '<h2>New Assignment</h2><p>You have been assigned to: {{assignmentType}}</p><p><strong>Description:</strong> {{description}}</p><p><strong>Location:</strong> {{location}}</p><p><strong>Scheduled:</strong> {{scheduledAt}}</p>',
 '["assignmentType", "description", "location", "scheduledAt"]'),

('notification_general_push', 'push', 'general', '{{title}}',
 '{{message}}',
 '["title", "message"]');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_template_id ON notifications(template_id);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON notifications(category);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_user_status ON notifications(user_id, status);

CREATE INDEX IF NOT EXISTS idx_notification_templates_type ON notification_templates(type);
CREATE INDEX IF NOT EXISTS idx_notification_templates_category ON notification_templates(category);
CREATE INDEX IF NOT EXISTS idx_notification_templates_active ON notification_templates(is_active);

CREATE INDEX IF NOT EXISTS idx_websocket_connections_user_id ON websocket_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_websocket_connections_socket_id ON websocket_connections(socket_id);
CREATE INDEX IF NOT EXISTS idx_websocket_connections_room ON websocket_connections(room);

CREATE INDEX IF NOT EXISTS idx_real_time_events_event_type ON real_time_events(event_type);
CREATE INDEX IF NOT EXISTS idx_real_time_events_entity ON real_time_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_real_time_events_room ON real_time_events(room);

CREATE INDEX IF NOT EXISTS idx_notification_delivery_log_notification_id ON notification_delivery_log(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_log_status ON notification_delivery_log(status);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_log_method ON notification_delivery_log(delivery_method);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON notification_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to clean up old websocket connections
CREATE OR REPLACE FUNCTION cleanup_old_websocket_connections()
RETURNS void AS $$
BEGIN
    DELETE FROM websocket_connections 
    WHERE last_activity < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;