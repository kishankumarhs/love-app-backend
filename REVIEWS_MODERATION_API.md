# Reviews, Moderation & Reporting API

## Overview
Complete review system with moderation queue, admin reporting capabilities, and comprehensive audit logging for all CRUD actions.

## Features
- User-submitted reviews with moderation workflow
- Content reporting and moderation queue
- Admin export reporting (CSV/XLSX/JSON)
- Comprehensive audit logging for all actions
- Review helpful voting system
- Automated moderation status tracking

## API Endpoints

### Reviews
```http
POST /reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "comment": "Excellent service!",
  "providerId": "uuid"
}
```

### Get Reviews
```http
GET /reviews?status=approved&providerId=uuid&limit=20&offset=0
```

### Get Provider Reviews
```http
GET /reviews/provider/:providerId?limit=20&offset=0
```

### Report Review
```http
POST /reviews/:id/report
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "spam",
  "description": "This review appears to be spam"
}
```

### Moderate Review
```http
POST /reviews/:id/moderate
Authorization: Bearer <token>
Content-Type: application/json

{
  "action": "approve",
  "rejectionReason": "Inappropriate content"
}
```

### Moderation Queue
```http
GET /reviews/moderation/queue?status=pending&contentType=review&limit=50&offset=0
Authorization: Bearer <token>
```

### Resolve Moderation
```http
POST /reviews/moderation/:id/resolve
Authorization: Bearer <token>
Content-Type: application/json

{
  "action": "approve",
  "notes": "Content is appropriate"
}
```

### Admin Reports
```http
POST /reviews/reports
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Monthly User Report",
  "type": "users",
  "format": "xlsx",
  "filters": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "role": "user"
  },
  "columns": ["id", "email", "firstName", "lastName", "createdAt"]
}
```

### Download Report
```http
GET /reviews/reports/:id/download
Authorization: Bearer <token>
```

### Audit Logs
```http
GET /reviews/audit?entityType=Review&action=CREATE&limit=100&offset=0
Authorization: Bearer <token>
```

## Database Schema

### Reviews Table (Updated)
- `id` (UUID, Primary Key)
- `rating` (Integer 1-5)
- `comment` (Text)
- `status` (Enum: pending, approved, rejected, flagged)
- `is_anonymous` (Boolean)
- `helpful_count` (Integer)
- `reported_count` (Integer)
- `user_id`, `provider_id` (UUID, Foreign Keys)
- `moderated_by` (UUID, Foreign Key)
- `moderated_at` (Timestamp)
- `rejection_reason` (Text)
- `created_at`, `updated_at`

### Moderation Queue Table
- `id` (UUID, Primary Key)
- `content_type` (Enum: review, comment, report, user_profile)
- `content_id` (UUID)
- `reported_by` (UUID, Foreign Key)
- `reason` (Enum: spam, inappropriate, harassment, fake, offensive, other)
- `description` (Text)
- `status` (Enum: pending, reviewed, resolved, dismissed)
- `priority` (Enum: low, medium, high, urgent)
- `assigned_to`, `resolved_by` (UUID, Foreign Keys)
- `resolution_notes` (Text)
- `created_at`, `updated_at`, `resolved_at`

### Audit Logs Table
- `id` (UUID, Primary Key)
- `entity_type` (String)
- `entity_id` (UUID)
- `action` (Enum: CREATE, UPDATE, DELETE, LOGIN, LOGOUT)
- `user_id` (UUID, Foreign Key)
- `user_email` (String)
- `ip_address` (INET)
- `user_agent` (Text)
- `old_values`, `new_values`, `changes` (JSONB)
- `metadata` (JSONB)
- `created_at`

### Reports Table
- `id` (UUID, Primary Key)
- `name` (String)
- `type` (Enum: users, providers, campaigns, donations, reviews, volunteers, custom)
- `filters` (JSONB)
- `columns` (JSONB Array)
- `format` (Enum: csv, xlsx, json)
- `status` (Enum: pending, processing, completed, failed)
- `file_path` (String)
- `file_size` (Integer)
- `generated_by` (UUID, Foreign Key)
- `generated_at`, `expires_at`
- `download_count` (Integer)
- `error_message` (Text)

### Review Helpful Table
- `id` (UUID, Primary Key)
- `review_id` (UUID, Foreign Key)
- `user_id` (UUID, Foreign Key)
- `is_helpful` (Boolean)
- `created_at`

## Review Status Flow
1. **Pending** - Newly submitted review awaiting moderation
2. **Approved** - Review approved by moderator, visible to public
3. **Rejected** - Review rejected by moderator, not visible
4. **Flagged** - Review flagged for additional review

## Moderation Workflow
1. User reports content or automatic flagging occurs
2. Content added to moderation queue with priority
3. Moderator reviews and assigns status
4. Resolution applied with notes and action taken
5. Audit log created for all moderation actions

## Report Types
- **Users**: User accounts with registration and activity data
- **Providers**: Service provider information and statistics
- **Campaigns**: Campaign details with funding information
- **Donations**: Transaction records and payment data
- **Reviews**: Review content with ratings and moderation status
- **Volunteers**: Volunteer profiles and assignment history
- **Custom**: Flexible reporting with custom queries

## Export Formats
- **CSV**: Comma-separated values for spreadsheet import
- **XLSX**: Excel format with formatting and multiple sheets
- **JSON**: Structured data format for API consumption

## Audit Actions Tracked
- **CREATE**: New entity creation
- **UPDATE**: Entity modifications with before/after values
- **DELETE**: Entity removal with final state
- **LOGIN**: User authentication events
- **LOGOUT**: User session termination

## Security Features
- Role-based access control for moderation
- IP address and user agent tracking
- Audit trail for all administrative actions
- Report file expiration and cleanup
- Content reporting rate limiting

## Usage Examples

### Review Submission and Moderation
```javascript
// Submit review
const review = await fetch('/reviews', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    rating: 5,
    comment: 'Great service!',
    providerId: 'provider-uuid'
  })
});

// Report inappropriate review
await fetch(`/reviews/${reviewId}/report`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    reason: 'inappropriate',
    description: 'Contains offensive language'
  })
});

// Moderate review (admin only)
await fetch(`/reviews/${reviewId}/moderate`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'reject',
    rejectionReason: 'Violates community guidelines'
  })
});
```

### Admin Reporting
```javascript
// Generate user report
const report = await fetch('/reviews/reports', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Monthly Active Users',
    type: 'users',
    format: 'xlsx',
    filters: {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      role: 'user'
    },
    columns: ['id', 'email', 'firstName', 'lastName', 'createdAt']
  })
});

// Download completed report
const reportFile = await fetch(`/reviews/reports/${reportId}/download`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Audit Log Querying
```javascript
// Get audit logs for specific entity
const auditLogs = await fetch('/reviews/audit?' + new URLSearchParams({
  entityType: 'Review',
  entityId: 'review-uuid',
  action: 'UPDATE',
  startDate: '2024-01-01',
  limit: '50'
}), {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## Performance Considerations
- Indexed queries on frequently searched fields
- Automatic report file cleanup after expiration
- Pagination for large result sets
- Efficient audit log storage with JSONB
- Background processing for report generation

## Testing
- Test review submission and moderation workflow
- Verify audit logging for all CRUD operations
- Test report generation in all formats
- Validate moderation queue functionality
- Test role-based access controls