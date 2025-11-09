# Love App MVP Backend 🚀

A fully working NestJS monorepo backend for the Love App MVP - a comprehensive community support platform with provider discovery, emergency SOS system, donation management, volunteer coordination, and multi-channel notifications.

## 🏗️ Architecture

### NestJS Monorepo Structure

```text
├── apps/
│   └── api/                 # Main API application
├── libs/                    # Shared libraries
│   ├── auth/               # JWT + Social login (Google, Apple)
│   ├── providers/          # Service providers & campaigns
│   ├── donations/          # Stripe & PayPal integration
│   ├── slots/              # Scheduling & slot management
│   ├── notifications/      # Email, SMS, Push templates
│   ├── audit/              # CRUD operation logging
│   ├── connectivity/       # Wi-Fi voucher tokens
│   └── common/             # Shared entities & utilities
├── migrations/             # Database schema
├── seeds/                  # Sample data
└── postman/               # API testing collection
```

### Tech Stack

- **Framework**: NestJS v10+ Monorepo with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT + Passport (Google, Apple, Email)
- **Payments**: Stripe & PayPal hosted checkout
- **Notifications**: Email (Nodemailer), SMS (Twilio), Templates (Handlebars)
- **Caching**: Redis
- **Documentation**: Swagger/OpenAPI
- **Deployment**: Docker + Docker Compose

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 13+
- Redis 6+
- Docker & Docker Compose (optional)

### 1. Installation

```bash
# Clone and install
git clone <repository-url>
cd love-app-backend
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration
```

### 2. Database Setup

```bash
# Start PostgreSQL (Docker)
docker-compose up postgres -d

# Run migrations
npm run migration:run

# Seed sample data
psql -h localhost -U postgres -d love_app_dev -f seeds/001-seed-data.sql
```

### 3. Start Development Server

```bash
# Start all services
docker-compose up -d

# Or start API only
npm run dev
```

### 4. Access API

- **API**: <http://localhost:3000>
- **Swagger Docs**: <http://localhost:3000/api/docs>
- **Health Check**: <http://localhost:3000/health>

## 📊 Database Schema

### Core Entities

#### Organizations (orgs)

```sql
- id, kind (provider/sponsor/partner), status, verified_at, trusted
- name, domain, phone, address, geo (lat/lng)
```

#### Users

```sql
- id, role (seeker/provider_admin/provider_staff/admin/subadmin/volunteer)
- org_id, email, password, mfa, status, timezone, language
```

#### Services

```sql
- id, org_id, category_id, name, description, location (geo)
- hours (JSON), eligibility (JSON), capacity (JSON), visibility, status
```

#### Campaigns

```sql
- id, org_id, name, description, start_at, end_at, status, visibility
- campaign_locations: multi-location support
```

#### Referrals/Attendance

```sql
- id, seeker_id, service_id/campaign_id, status, scheduled_at, fulfilled_at, notes
```

#### Vouchers

```sql
- id, type (amount/unit/access), issuer_org_id, sponsor_partner_id
- value/unit_label, valid_from/to, usage_limit, code, QR, status
```

#### Donations

```sql
- id, donor_user_id, provider_org_id, campaign_id, amount, currency
- provider (stripe/paypal), status, external_transaction_id
```

#### Audit Logs

```sql
- id, actor_id, action, entity_type, entity_id, before/after, timestamp
```

## 🔐 Authentication & Authorization

### Supported Methods

- **Email/Password**: Standard registration and login
- **Google OAuth**: Social login integration
- **Apple OAuth**: Social login integration
- **Guest Access**: Read-only browsing

### RBAC Roles

- **Seeker**: Browse providers, submit referrals, SOS, feedback, donations
- **Provider Admin**: Manage organization, services, campaigns, employees
- **Provider Staff**: Basic operations, QR scanning, voucher issuance
- **Admin**: Full system access, provider approval, category management
- **Sub-admin**: Limited admin capabilities
- **Volunteer**: Volunteer-specific features

### JWT Configuration

```typescript
// JWT tokens with role-based claims
{
  sub: userId,
  email: userEmail,
  role: userRole,
  org_id: organizationId
}
```

## 💰 Payment Integration

### Stripe Integration

```typescript
// Hosted Checkout
POST /api/v1/donations/stripe/checkout
{
  "amount": 50.00,
  "success_url": "https://app.com/success",
  "cancel_url": "https://app.com/cancel",
  "campaign_id": "uuid"
}
```

### PayPal Integration

```typescript
// PayPal Orders
POST /api/v1/donations/paypal/order
{
  "amount": 25.00,
  "return_url": "https://app.com/success",
  "cancel_url": "https://app.com/cancel"
}
```

## 📅 Slot-Based Scheduling

### Slot Policy Configuration

```typescript
POST /api/v1/slots/policy
{
  "service_id": "uuid",
  "slot_size": 30,        // minutes
  "max_per_slot": 10,     // capacity
  "operating_hours": {
    "monday": {"start": "09:00", "end": "17:00"},
    "tuesday": {"start": "09:00", "end": "17:00"}
  },
  "booking_lead_time": 60,  // minutes
  "cancel_cutoff": 30       // minutes
}
```

### Get Available Slots

```typescript
GET /api/v1/slots?date=2024-01-15&service_id=uuid
// Returns generated time slots based on policy
```

## 📱 Multi-Channel Notifications

### Template System

```typescript
// Email Template with Handlebars
{
  "key": "referral_accepted",
  "subject": "Your referral has been accepted",
  "body": "<h2>Referral Accepted</h2><p>{{providerName}} has accepted your referral for {{serviceName}}.</p>",
  "variables": ["providerName", "serviceName", "scheduledDate"]
}
```

### Send Notifications

```typescript
POST /api/v1/notifications/send
{
  "recipientId": "uuid",
  "templateKey": "referral_accepted",
  "variables": {
    "providerName": "Community Food Bank",
    "serviceName": "Free Meal Service"
  },
  "type": "email" // email, sms, push
}
```

## 🌐 Wi-Fi Connectivity

### Generate Access Tokens

```typescript
POST /api/v1/connectivity/token
{
  "ttl": 3600,  // 1 hour
  "metadata": {
    "location": "Main Hall",
    "issued_by": "Staff Member"
  }
}
// Returns: { "token": "ABC123DEF456", "expires_at": "..." }
```

### Validate Tokens

```typescript
POST /api/v1/connectivity/validate
{
  "token": "ABC123DEF456"
}
// Returns: { "valid": true, "expires_at": "..." }
```

## 📊 Audit Logging

All CRUD operations are automatically logged:

```typescript
{
  "actor_id": "user-uuid",
  "action": "CREATE|UPDATE|DELETE",
  "entity_type": "campaigns",
  "entity_id": "entity-uuid",
  "before": {...},  // Previous state
  "after": {...},   // New state
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 🔍 API Endpoints Overview

### Help Seekers

- `GET /api/v1/providers/search` - Browse providers (map/list, filters)
- `POST /api/v1/referrals` - Submit referral/request
- `POST /api/v1/sos` - Emergency SOS (registered users only)
- `POST /api/v1/reviews` - Leave feedback (anonymous for guests)
- `POST /api/v1/donations/*/checkout` - One-time donations

### Providers

- `POST /api/v1/providers` - Register as provider
- `POST /api/v1/services` - CRUD services & campaigns
- `POST /api/v1/providers/:id/employees` - Add/manage employees
- `PUT /api/v1/services/:id/capacity` - Capacity management
- `POST /api/v1/vouchers` - Issue vouchers
- `GET /api/v1/providers/:id/dashboard` - Dashboard metrics

### Super Admin

- `PUT /api/v1/providers/:id/approve` - Approve/deny providers
- `POST /api/v1/categories` - Manage categories
- `PUT /api/v1/reviews/:id/moderate` - Review moderation
- `POST /api/v1/campaigns/donation` - Create donation campaigns
- `POST /api/v1/volunteers/assign` - Assign volunteers
- `GET /api/v1/admin/reports` - Export reports (CSV/XLSX)

### Scheduling

- `POST /api/v1/slots/policy` - Configure slot policies
- `GET /api/v1/slots` - Get available slots
- `POST /api/v1/slots/:id/book` - Book time slot

## 🧪 Testing

### Postman Collection

```bash
# Import collection and environment
# Files: ./postman/Love-App-MVP.postman_collection.json
#        ./postman/Love-App-Environment.postman_environment.json

# Auto-authentication included
# Test all MVP endpoints
```

### Sample Test Users

```typescript
// Admin
email: admin@loveapp.com
password: password123

// Provider
email: provider@foodbank.org
password: password123

// Seeker
email: seeker@example.com
password: password123
```

## 🚀 Deployment

### Docker Production

```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up -d

# Health check
curl http://localhost:3000/health
```

### Environment Variables

```bash
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=love_app_dev

# JWT
JWT_SECRET=your-super-secure-secret
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret

# Social Login
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
APPLE_CLIENT_ID=your-apple-client-id

# Notifications
MAIL_HOST=smtp.gmail.com
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
```

## 📈 Key Features Implemented

✅ **Authentication**: JWT + Google/Apple OAuth + Guest access  
✅ **RBAC**: 6-role authorization system  
✅ **Provider Management**: Registration, approval, multi-location  
✅ **Service Discovery**: Geo-search, filters, capacity tracking  
✅ **Campaign System**: Multi-location campaigns with scheduling  
✅ **Donation Processing**: Stripe + PayPal hosted checkout  
✅ **Slot Scheduling**: Configurable time slots with booking  
✅ **Voucher System**: QR codes, usage tracking, expiration  
✅ **Emergency SOS**: Location-based alerts  
✅ **Multi-Channel Notifications**: Email, SMS, Push templates  
✅ **Audit Logging**: Complete CRUD operation tracking  
✅ **Wi-Fi Connectivity**: Token-based access control  
✅ **Admin Dashboard**: Analytics, reporting, moderation  
✅ **API Documentation**: Complete Swagger/OpenAPI docs  
✅ **Docker Ready**: Full containerization

## 🎯 MVP Acceptance Criteria

1. ✅ Guests can browse providers and view details; SOS requires sign-in
2. ✅ Registered seekers can submit referrals, SOS, feedback, and donations
3. ✅ Providers can create campaigns/services, add employees, manage capacity, scan QR codes, issue vouchers
4. ✅ Admin can approve providers, manage categories/campaigns/reviews/donations, assign volunteers, export reports
5. ✅ Donations flow via Stripe/PayPal with attribution tracking
6. ✅ All critical writes logged to AuditLog
7. ✅ Slot-based scheduling works per service/campaign
8. ✅ Wi-Fi voucher tokens issued and validated internally

## 📞 Support

- **Documentation**: Complete API docs at `/api/docs`
- **Postman Collection**: Ready-to-use API testing
- **Sample Data**: Seeded with realistic test data
- **Docker Support**: One-command deployment
- **Health Checks**: Built-in monitoring endpoints

---

**Ready to run Love App MVP backend with all features implemented! 🚀**
