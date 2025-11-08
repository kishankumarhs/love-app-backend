# Volunteer and Wi-Fi Voucher Features API

## Overview
Complete volunteer management system with application process, location preferences, and Wi-Fi voucher generation with status tracking and expiry validation.

## Features
- Volunteer application and approval workflow
- Location preferences and interests management
- Wi-Fi voucher code generation and activation
- Voucher status tracking and expiry validation
- Volunteer assignment management
- Usage logging and analytics

## API Endpoints

### Volunteer Applications
```http
POST /volunteers/applications
Authorization: Bearer <token>
Content-Type: application/json

{
  "interests": ["community_support", "emergency_response"],
  "skills": ["first_aid", "communication"],
  "availability": "weekends",
  "locationPreferences": {
    "preferredAreas": ["downtown", "suburbs"],
    "maxDistance": 25,
    "transportationMode": "car",
    "availableRegions": ["north", "central"]
  },
  "motivation": "Want to help my community",
  "experience": "Previous volunteer work at local shelter",
  "references": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "555-0123",
      "relationship": "supervisor"
    }
  ]
}
```

### Approve Application
```http
POST /volunteers/applications/:id/approve
Authorization: Bearer <token>
```

### Get Applications
```http
GET /volunteers/applications?status=pending
Authorization: Bearer <token>
```

### Get My Application
```http
GET /volunteers/applications/my
Authorization: Bearer <token>
```

### Wi-Fi Voucher Management
```http
POST /volunteers/vouchers
Authorization: Bearer <token>
Content-Type: application/json

{
  "providerId": "uuid",
  "campaignId": "uuid",
  "durationHours": 24,
  "bandwidthLimitMb": 1000,
  "maxDevices": 2
}
```

### Activate Voucher
```http
POST /volunteers/vouchers/activate
Content-Type: application/json

{
  "code": "ABCD1234EFGH",
  "deviceInfo": {
    "macAddress": "00:11:22:33:44:55",
    "deviceType": "smartphone",
    "userAgent": "Mozilla/5.0..."
  }
}
```

### Get Voucher by Code
```http
GET /volunteers/vouchers/code/:code
```

### Get Provider Vouchers
```http
GET /volunteers/vouchers/provider/:providerId
Authorization: Bearer <token>
```

### Volunteer Management
```http
GET /volunteers/:id/assignments
Authorization: Bearer <token>
```

## Database Schema

### Volunteer Applications Table
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `interests` (Text Array)
- `skills` (Text Array)
- `availability` (String)
- `location_preferences` (JSONB)
- `motivation` (Text)
- `experience` (Text)
- `references` (JSONB Array)
- `status` (Enum: pending, approved, rejected, withdrawn)
- `reviewed_by` (UUID, Foreign Key)
- `reviewed_at`, `rejection_reason`
- `created_at`, `updated_at`

### Wi-Fi Vouchers Table
- `id` (UUID, Primary Key)
- `code` (String, Unique)
- `provider_id` (UUID, Foreign Key)
- `campaign_id` (UUID, Foreign Key, Optional)
- `user_id` (UUID, Foreign Key, Optional)
- `status` (Enum: active, used, expired, revoked)
- `duration_hours` (Integer)
- `bandwidth_limit_mb` (Integer)
- `max_devices` (Integer)
- `expires_at` (Timestamp)
- `activated_at`, `used_at` (Timestamp)
- `device_info`, `usage_stats` (JSONB)
- `created_at`, `updated_at`

### Voucher Usage Logs Table
- `id` (UUID, Primary Key)
- `voucher_id` (UUID, Foreign Key)
- `event_type` (Enum: created, activated, used, expired, revoked, bandwidth_exceeded)
- `device_mac` (String)
- `device_info` (JSONB)
- `ip_address` (INET)
- `data_used_mb` (Decimal)
- `session_duration_minutes` (Integer)
- `created_at`

### Volunteer Assignments Table
- `id` (UUID, Primary Key)
- `volunteer_id` (UUID, Foreign Key)
- `campaign_id` (UUID, Foreign Key, Optional)
- `provider_id` (UUID, Foreign Key, Optional)
- `assignment_type` (Enum: campaign_support, emergency_response, community_outreach, technical_support)
- `status` (Enum: assigned, accepted, declined, completed, cancelled)
- `priority` (Enum: low, medium, high, urgent)
- `description` (Text)
- `location` (JSONB)
- `scheduled_at`, `started_at`, `completed_at`
- `feedback` (Text)
- `rating` (Integer 1-5)
- `created_at`, `updated_at`

## Voucher Code Generation
- 12-character alphanumeric codes
- Format: XXXX-XXXX-XXXX (displayed with hyphens)
- Unique constraint enforced at database level
- Collision detection and retry logic

## Expiry Validation
- Automatic expiry check on activation
- Hourly cron job to expire vouchers
- Bandwidth limit enforcement
- Device limit validation

## Location Preferences
```json
{
  "preferredAreas": ["downtown", "suburbs", "rural"],
  "maxDistance": 25,
  "transportationMode": "car|public_transport|bicycle|walking",
  "availableRegions": ["north", "south", "east", "west", "central"]
}
```

## Volunteer Interests
- community_support
- emergency_response
- technical_support
- education
- healthcare
- environmental
- elderly_care
- youth_programs

## Volunteer Skills
- first_aid
- communication
- technical_skills
- language_translation
- counseling
- event_planning
- fundraising
- social_media

## Usage Examples

### Volunteer Application Flow
```javascript
// Submit application
const application = await fetch('/volunteers/applications', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    interests: ['community_support', 'emergency_response'],
    skills: ['first_aid', 'communication'],
    availability: 'weekends',
    locationPreferences: {
      preferredAreas: ['downtown'],
      maxDistance: 20,
      transportationMode: 'car'
    },
    motivation: 'Want to help my community'
  })
});

// Check application status
const myApplication = await fetch('/volunteers/applications/my', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Voucher Management Flow
```javascript
// Create voucher
const voucher = await fetch('/volunteers/vouchers', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    providerId: 'provider-uuid',
    durationHours: 24,
    bandwidthLimitMb: 1000
  })
});

// Activate voucher
const activation = await fetch('/volunteers/vouchers/activate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code: 'ABCD1234EFGH',
    deviceInfo: {
      macAddress: '00:11:22:33:44:55',
      deviceType: 'smartphone'
    }
  })
});
```

## Security Features
- Role-based access control for applications
- Voucher code uniqueness validation
- Device tracking and limits
- Usage monitoring and logging
- Automatic expiry enforcement

## Testing
- Test voucher code generation uniqueness
- Verify expiry validation logic
- Test application approval workflow
- Validate location preference filtering
- Test bandwidth limit enforcement