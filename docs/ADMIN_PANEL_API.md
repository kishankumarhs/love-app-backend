# Admin Panel API Documentation

## Overview

Comprehensive admin panel API with role-based access control, advanced filtering, analytics, and management capabilities for all system entities.

## Role-Based Access Control (RBAC)

### User Roles

- **SUPER_ADMIN**: Full system access, can manage admins and system settings
- **ADMIN**: Can manage users, providers, campaigns, donations, and volunteers
- **PROVIDER**: Limited access to own resources
- **VOLUNTEER**: Limited access to volunteer-related features
- **USER**: Basic user access

### Access Levels

```typescript
// Super Admin Only
- System settings management
- Admin actions log
- User deletion
- Critical system operations

// Admin + Super Admin
- User management (suspend/activate)
- Provider approval/rejection
- Campaign management
- Donation oversight
- Volunteer management
- Analytics and reporting

// Provider
- Own provider data
- Own campaigns
- Own donations received

// Volunteer
- Own volunteer profile
- Assigned tasks
- Availability management
```

## API Endpoints

### Dashboard & Analytics

#### Get Dashboard Metrics

```http
GET /admin/dashboard
Authorization: Bearer <admin-token>
```

**Response:**

```json
{
  "overview": {
    "totalUsers": 1250,
    "totalProviders": 45,
    "totalCampaigns": 123,
    "totalDonations": 2340,
    "totalVolunteers": 89
  },
  "recent": {
    "newUsers": 23,
    "donationAmount": 5420.5
  }
}
```

#### Get Analytics Data

```http
GET /admin/analytics?metricType=donations&periodType=daily&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <admin-token>
```

**Query Parameters:**

- `metricType`: users, providers, campaigns, donations, volunteers, sos_alerts, reviews
- `periodType`: daily, weekly, monthly, yearly
- `startDate`: ISO date string
- `endDate`: ISO date string

### User Management

#### Get Users with Filters

```http
GET /admin/users?search=john&status=active&role=user&page=1&limit=20&sortBy=createdAt&sortOrder=DESC
Authorization: Bearer <admin-token>
```

**Query Parameters:**

- `search`: Search in email, firstName, lastName
- `status`: active, inactive, suspended
- `role`: user, provider, volunteer, admin, super_admin
- `startDate`: Filter by creation date
- `endDate`: Filter by creation date
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `sortBy`: Field to sort by
- `sortOrder`: ASC or DESC

**Response:**

```json
{
  "users": [
    {
      "id": "uuid",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "status": "active",
      "isEmailVerified": true,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1250
}
```

#### Manage User

```http
POST /admin/users/manage
Authorization: Bearer <super-admin-token>
Content-Type: application/json

{
  "userId": "uuid",
  "action": "suspend",
  "reason": "Violation of terms of service"
}
```

**Actions:** suspend, activate, delete

### Provider Management

#### Get Providers with Filters

```http
GET /admin/providers?search=clinic&status=pending&page=1&limit=20
Authorization: Bearer <admin-token>
```

**Response:**

```json
{
  "providers": [
    {
      "id": "uuid",
      "name": "Community Health Clinic",
      "email": "contact@clinic.com",
      "phone": "+1234567890",
      "address": "123 Main St",
      "status": "pending",
      "services": ["healthcare", "emergency"],
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 45
}
```

#### Manage Provider

```http
POST /admin/providers/manage
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "providerId": "uuid",
  "action": "approve",
  "reason": "Meets all requirements"
}
```

**Actions:** approve, reject, suspend

### Campaign Management

#### Get Campaigns with Filters

```http
GET /admin/campaigns?search=emergency&status=active&page=1&limit=20
Authorization: Bearer <admin-token>
```

**Response:**

```json
{
  "campaigns": [
    {
      "id": "uuid",
      "title": "Emergency Relief Fund",
      "description": "Help families affected by natural disaster",
      "goalAmount": 10000.0,
      "currentAmount": 7500.5,
      "status": "active",
      "provider": {
        "id": "uuid",
        "name": "Relief Organization"
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 123
}
```

### Donation Management

#### Get Donations with Filters

```http
GET /admin/donations?status=completed&startDate=2024-01-01&endDate=2024-01-31&page=1&limit=20
Authorization: Bearer <admin-token>
```

**Response:**

```json
{
  "donations": [
    {
      "id": "uuid",
      "amount": 50.0,
      "status": "completed",
      "user": {
        "id": "uuid",
        "email": "donor@example.com"
      },
      "campaign": {
        "id": "uuid",
        "title": "Emergency Relief Fund"
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 2340
}
```

### Volunteer Management

#### Get Volunteers with Filters

```http
GET /admin/volunteers?search=john&status=active&page=1&limit=20
Authorization: Bearer <admin-token>
```

**Response:**

```json
{
  "volunteers": [
    {
      "id": "uuid",
      "user": {
        "id": "uuid",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      },
      "interests": ["emergency_response", "community_support"],
      "skills": ["first_aid", "communication"],
      "status": "active",
      "verificationStatus": "verified",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 89
}
```

### System Settings

#### Get System Settings

```http
GET /admin/settings
Authorization: Bearer <super-admin-token>
```

**Response:**

```json
[
  {
    "id": "uuid",
    "settingKey": "max_campaign_duration_days",
    "settingValue": "365",
    "settingType": "number",
    "description": "Maximum campaign duration in days",
    "isPublic": false,
    "updatedBy": {
      "id": "uuid",
      "email": "admin@example.com"
    },
    "updatedAt": "2024-01-15T10:30:00Z"
  }
]
```

#### Update System Setting

```http
PUT /admin/settings/max_campaign_duration_days
Authorization: Bearer <super-admin-token>
Content-Type: application/json

{
  "value": "180"
}
```

### Admin Actions Log

#### Get Admin Actions

```http
GET /admin/actions?startDate=2024-01-01&endDate=2024-01-31&page=1&limit=20
Authorization: Bearer <super-admin-token>
```

**Response:**

```json
{
  "actions": [
    {
      "id": "uuid",
      "admin": {
        "id": "uuid",
        "email": "admin@example.com"
      },
      "actionType": "user_suspend",
      "targetType": "User",
      "targetId": "uuid",
      "reason": "Violation of terms",
      "metadata": {},
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 156
}
```

## Advanced Filtering

### Filter Parameters

All list endpoints support these common filters:

```typescript
interface AdminFiltersDto {
  search?: string; // Text search in relevant fields
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  status?: string; // Entity-specific status
  role?: string; // User role (for users endpoint)
  page?: number; // Page number (default: 1)
  limit?: number; // Items per page (default: 20)
  sortBy?: string; // Field to sort by
  sortOrder?: 'ASC' | 'DESC'; // Sort direction (default: DESC)
}
```

### Search Capabilities

- **Users**: Search in email, firstName, lastName
- **Providers**: Search in name, email
- **Campaigns**: Search in title, description
- **Volunteers**: Search in user's firstName, lastName

### Date Range Filtering

All entities support date range filtering using `startDate` and `endDate` parameters.

## Database Schema

### Admin Analytics Table

```sql
CREATE TABLE admin_analytics (
    id UUID PRIMARY KEY,
    metric_type VARCHAR(50) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,2) NOT NULL,
    period_type VARCHAR(20) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Admin Actions Table

```sql
CREATE TABLE admin_actions (
    id UUID PRIMARY KEY,
    admin_id UUID NOT NULL REFERENCES users(id),
    action_type VARCHAR(50) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id UUID NOT NULL,
    reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### System Settings Table

```sql
CREATE TABLE system_settings (
    id UUID PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    setting_type VARCHAR(20) DEFAULT 'string',
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Security Features

### Authentication & Authorization

- JWT token-based authentication
- Role-based access control with guards
- Action-level permissions
- Admin action logging

### Data Protection

- Sensitive data filtering based on user role
- Audit trail for all admin actions
- IP address and user agent tracking
- Rate limiting on admin endpoints

### Input Validation

- DTO validation with class-validator
- SQL injection prevention
- XSS protection
- Parameter sanitization

## Usage Examples

### Frontend Admin Dashboard

```javascript
// Get dashboard metrics
const getDashboardData = async () => {
  const response = await fetch('/admin/dashboard', {
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });
  return response.json();
};

// Get users with filters
const getUsers = async (filters) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/admin/users?${params}`, {
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });
  return response.json();
};

// Manage user
const suspendUser = async (userId, reason) => {
  const response = await fetch('/admin/users/manage', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${superAdminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      action: 'suspend',
      reason,
    }),
  });
  return response.json();
};
```

### Analytics Dashboard

```javascript
// Get donation analytics
const getDonationAnalytics = async (period) => {
  const params = new URLSearchParams({
    metricType: 'donations',
    periodType: period,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
  });

  const response = await fetch(`/admin/analytics?${params}`, {
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });
  return response.json();
};

// Display metrics in chart
const displayAnalytics = (data) => {
  const chartData = data.map((item) => ({
    date: item.periodStart,
    value: item.metricValue,
    name: item.metricName,
  }));

  // Use with Chart.js, D3.js, or other charting library
  renderChart(chartData);
};
```

### System Settings Management

```javascript
// Get all settings
const getSettings = async () => {
  const response = await fetch('/admin/settings', {
    headers: {
      Authorization: `Bearer ${superAdminToken}`,
    },
  });
  return response.json();
};

// Update setting
const updateSetting = async (key, value) => {
  const response = await fetch(`/admin/settings/${key}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${superAdminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ value }),
  });
  return response.json();
};
```

## Performance Considerations

### Database Optimization

- Indexed queries on frequently searched fields
- Pagination to limit result sets
- Efficient joins with selected fields only
- Query optimization for analytics

### Caching Strategy

- Dashboard metrics caching (5-minute TTL)
- System settings caching
- User role caching
- Analytics data caching

### Rate Limiting

- Admin endpoints: 100 requests/minute
- Analytics endpoints: 50 requests/minute
- Management actions: 20 requests/minute
- Settings updates: 10 requests/minute

## Monitoring & Logging

### Admin Action Tracking

All admin actions are logged with:

- Admin user ID and email
- Action type and target
- Timestamp and reason
- IP address and user agent
- Before/after values for updates

### Analytics Metrics

Automated daily calculation of:

- User registration trends
- Donation amounts and counts
- Campaign performance
- SOS alert frequency
- System usage patterns

### Error Monitoring

- Failed admin actions
- Permission violations
- System errors
- Performance bottlenecks

This comprehensive admin panel provides full system oversight with proper security, logging, and performance optimization.
