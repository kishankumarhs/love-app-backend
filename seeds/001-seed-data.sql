-- Seed data for Love App MVP

-- Insert default categories
INSERT INTO categories (id, name, active, custom_schema) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Food & Nutrition', true, '{"fields": ["dietary_restrictions", "meal_type"]}'),
('550e8400-e29b-41d4-a716-446655440002', 'Housing & Shelter', true, '{"fields": ["housing_type", "duration"]}'),
('550e8400-e29b-41d4-a716-446655440003', 'Healthcare', true, '{"fields": ["service_type", "insurance_required"]}'),
('550e8400-e29b-41d4-a716-446655440004', 'Employment', true, '{"fields": ["job_type", "skill_level"]}'),
('550e8400-e29b-41d4-a716-446655440005', 'Education', true, '{"fields": ["education_level", "subject"]}'),
('550e8400-e29b-41d4-a716-446655440006', 'Legal Services', true, '{"fields": ["legal_area", "urgency"]}'),
('550e8400-e29b-41d4-a716-446655440007', 'Mental Health', true, '{"fields": ["service_type", "age_group"]}'),
('550e8400-e29b-41d4-a716-446655440008', 'Transportation', true, '{"fields": ["transport_type", "accessibility"]}')
ON CONFLICT (id) DO NOTHING;

-- Insert sample admin user
INSERT INTO users (id, role, email, password, "firstName", "lastName", status, "isEmailVerified") VALUES
('550e8400-e29b-41d4-a716-446655440100', 'admin', 'admin@loveapp.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxkUJqyqdG1ReJSiirQoUvIGIGS', 'System', 'Admin', 'active', true)
ON CONFLICT (email) DO NOTHING;

-- Insert sample provider organization
INSERT INTO orgs (id, kind, status, verified_at, trusted, name, phone, address, latitude, longitude) VALUES
('550e8400-e29b-41d4-a716-446655440200', 'provider', 'approved', CURRENT_TIMESTAMP, true, 'Community Food Bank', '+1-555-0123', '123 Main St, Anytown, ST 12345', 40.7128, -74.0060)
ON CONFLICT (id) DO NOTHING;

-- Insert sample provider admin user
INSERT INTO users (id, role, org_id, email, password, "firstName", "lastName", status, "isEmailVerified") VALUES
('550e8400-e29b-41d4-a716-446655440101', 'provider_admin', '550e8400-e29b-41d4-a716-446655440200', 'provider@foodbank.org', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxkUJqyqdG1ReJSiirQoUvIGIGS', 'Jane', 'Provider', 'active', true)
ON CONFLICT (email) DO NOTHING;

-- Insert sample service
INSERT INTO services (id, org_id, category_id, name, description, latitude, longitude, hours, eligibility, capacity) VALUES
('550e8400-e29b-41d4-a716-446655440300', '550e8400-e29b-41d4-a716-446655440200', '550e8400-e29b-41d4-a716-446655440001', 'Free Meal Service', 'Hot meals served daily to community members in need', 40.7128, -74.0060, 
'{"monday": {"start": "11:00", "end": "14:00"}, "tuesday": {"start": "11:00", "end": "14:00"}, "wednesday": {"start": "11:00", "end": "14:00"}, "thursday": {"start": "11:00", "end": "14:00"}, "friday": {"start": "11:00", "end": "14:00"}}',
'{"income_limit": 50000, "documentation_required": false}',
'{"max_daily": 200, "current": 0}')
ON CONFLICT (id) DO NOTHING;

-- Insert sample campaign
INSERT INTO campaigns (id, org_id, name, description, start_at, end_at, status, visibility) VALUES
('550e8400-e29b-41d4-a716-446655440400', '550e8400-e29b-41d4-a716-446655440200', 'Holiday Food Drive', 'Collecting and distributing food for families during the holiday season', 
CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 'active', 'public')
ON CONFLICT (id) DO NOTHING;

-- Insert campaign location
INSERT INTO campaign_locations (id, campaign_id, address, latitude, longitude, hours, capacity) VALUES
('550e8400-e29b-41d4-a716-446655440500', '550e8400-e29b-41d4-a716-446655440400', '123 Main St, Anytown, ST 12345', 40.7128, -74.0060,
'{"monday": {"start": "09:00", "end": "17:00"}, "tuesday": {"start": "09:00", "end": "17:00"}, "wednesday": {"start": "09:00", "end": "17:00"}, "thursday": {"start": "09:00", "end": "17:00"}, "friday": {"start": "09:00", "end": "17:00"}}',
'{"max_daily": 100, "current": 0}')
ON CONFLICT (id) DO NOTHING;

-- Insert sample seeker user
INSERT INTO users (id, role, email, password, "firstName", "lastName", status, "isEmailVerified") VALUES
('550e8400-e29b-41d4-a716-446655440102', 'seeker', 'seeker@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxkUJqyqdG1ReJSiirQoUvIGIGS', 'John', 'Seeker', 'active', true)
ON CONFLICT (email) DO NOTHING;

-- Insert notification templates
INSERT INTO notification_templates (id, key, name, type, category, subject, body, variables) VALUES
('550e8400-e29b-41d4-a716-446655440600', 'sos_alert', 'SOS Alert', 'email', 'sos', 'Emergency SOS Alert - {{location}}', 
'<h2>Emergency SOS Alert</h2><p>An emergency SOS has been triggered:</p><ul><li><strong>Location:</strong> {{location}}</li><li><strong>Time:</strong> {{timestamp}}</li><li><strong>User:</strong> {{userName}}</li><li><strong>Phone:</strong> {{userPhone}}</li></ul><p>Please respond immediately.</p>',
ARRAY['location', 'timestamp', 'userName', 'userPhone']),

('550e8400-e29b-41d4-a716-446655440601', 'referral_accepted', 'Referral Accepted', 'email', 'referral', 'Your referral has been accepted',
'<h2>Referral Accepted</h2><p>Good news! Your referral to {{providerName}} has been accepted.</p><p><strong>Service:</strong> {{serviceName}}</p><p><strong>Scheduled for:</strong> {{scheduledDate}}</p><p>Please arrive on time. If you need to cancel, please contact us at least 30 minutes before your appointment.</p>',
ARRAY['providerName', 'serviceName', 'scheduledDate']),

('550e8400-e29b-41d4-a716-446655440602', 'donation_received', 'Donation Received', 'email', 'donation', 'Thank you for your donation!',
'<h2>Thank You for Your Donation!</h2><p>We have received your generous donation of ${{amount}}.</p><p><strong>Campaign:</strong> {{campaignName}}</p><p><strong>Date:</strong> {{donationDate}}</p><p>Your support makes a real difference in our community. Thank you!</p>',
ARRAY['amount', 'campaignName', 'donationDate'])
ON CONFLICT (key) DO NOTHING;