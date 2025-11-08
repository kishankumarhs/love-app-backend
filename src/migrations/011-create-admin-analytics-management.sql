-- Migration 011: Create admin analytics and management tables

-- Create admin_analytics table for dashboard metrics
CREATE TABLE IF NOT EXISTS admin_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN ('users', 'providers', 'campaigns', 'donations', 'volunteers', 'sos_alerts', 'reviews')),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,2) NOT NULL,
    period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'yearly')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create admin_actions table for tracking admin activities
CREATE TABLE IF NOT EXISTS admin_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('user_suspend', 'user_activate', 'provider_approve', 'provider_reject', 'campaign_approve', 'campaign_suspend', 'volunteer_approve', 'content_moderate')),
    target_type VARCHAR(50) NOT NULL,
    target_id UUID NOT NULL,
    reason TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create system_settings table for configurable settings
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    setting_type VARCHAR(20) DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create admin_dashboard_widgets table for customizable dashboard
CREATE TABLE IF NOT EXISTS admin_dashboard_widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    widget_type VARCHAR(50) NOT NULL CHECK (widget_type IN ('metric_card', 'chart', 'table', 'map', 'activity_feed')),
    widget_config JSONB NOT NULL,
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    width INTEGER DEFAULT 1,
    height INTEGER DEFAULT 1,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('app_name', 'Love App', 'string', 'Application name', true),
('max_campaign_duration_days', '365', 'number', 'Maximum campaign duration in days', false),
('min_donation_amount', '1.00', 'number', 'Minimum donation amount', true),
('max_donation_amount', '10000.00', 'number', 'Maximum donation amount', true),
('sos_alert_radius_km', '10', 'number', 'SOS alert broadcast radius in kilometers', false),
('volunteer_background_check_required', 'false', 'boolean', 'Whether background check is required for volunteers', false),
('auto_approve_providers', 'false', 'boolean', 'Automatically approve new providers', false),
('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode', false);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_analytics_metric_type ON admin_analytics(metric_type);
CREATE INDEX IF NOT EXISTS idx_admin_analytics_period ON admin_analytics(period_type, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_admin_analytics_created_at ON admin_analytics(created_at);

CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_action_type ON admin_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target ON admin_actions(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at);

CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_system_settings_public ON system_settings(is_public);

CREATE INDEX IF NOT EXISTS idx_admin_dashboard_widgets_admin_id ON admin_dashboard_widgets(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_dashboard_widgets_visible ON admin_dashboard_widgets(is_visible);

-- Create trigger for updated_at timestamps
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_dashboard_widgets_updated_at BEFORE UPDATE ON admin_dashboard_widgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate analytics metrics
CREATE OR REPLACE FUNCTION calculate_daily_metrics()
RETURNS void AS $$
DECLARE
    current_date DATE := CURRENT_DATE;
    prev_date DATE := CURRENT_DATE - INTERVAL '1 day';
BEGIN
    -- Users metrics
    INSERT INTO admin_analytics (metric_type, metric_name, metric_value, period_type, period_start, period_end)
    SELECT 'users', 'new_registrations', COUNT(*), 'daily', prev_date, prev_date
    FROM users WHERE DATE(created_at) = prev_date;
    
    INSERT INTO admin_analytics (metric_type, metric_name, metric_value, period_type, period_start, period_end)
    SELECT 'users', 'total_active', COUNT(*), 'daily', prev_date, prev_date
    FROM users WHERE status = 'active';
    
    -- Donations metrics
    INSERT INTO admin_analytics (metric_type, metric_name, metric_value, period_type, period_start, period_end)
    SELECT 'donations', 'total_amount', COALESCE(SUM(amount), 0), 'daily', prev_date, prev_date
    FROM donations WHERE DATE(created_at) = prev_date AND status = 'completed';
    
    INSERT INTO admin_analytics (metric_type, metric_name, metric_value, period_type, period_start, period_end)
    SELECT 'donations', 'count', COUNT(*), 'daily', prev_date, prev_date
    FROM donations WHERE DATE(created_at) = prev_date AND status = 'completed';
    
    -- SOS alerts metrics
    INSERT INTO admin_analytics (metric_type, metric_name, metric_value, period_type, period_start, period_end)
    SELECT 'sos_alerts', 'count', COUNT(*), 'daily', prev_date, prev_date
    FROM sos_tickets WHERE DATE(created_at) = prev_date;
END;
$$ LANGUAGE plpgsql;