# LOVE App Backend - Module Structure

## Core Modules Created

### 1. **Auth Module** (`/auth`)

- Basic authentication module structure
- Imports UserModule for user management

### 2. **User Module** (`/user`)

- **Entity**: User with roles (USER, PROVIDER, VOLUNTEER, ADMIN, SUPER_ADMIN)
- **DTO**: CreateUserDto with validation
- **Service**: Basic CRUD operations
- **Controller**: REST endpoints with OpenAPI documentation

### 3. **Provider Module** (`/provider`)

- **Entity**: Provider with location data and user relationship
- **DTO**: CreateProviderDto with validation
- **Service**: CRUD with user relations
- **Controller**: REST endpoints

### 4. **Campaign Module** (`/campaign`)

- **Entity**: Campaign with target/raised amounts and provider relationship
- **DTO**: CreateCampaignDto with validation
- **Service**: CRUD with provider relations
- **Controller**: REST endpoints

### 5. **Requests Module** (`/requests`)

- **Entity**: Request with user and provider relationships
- **DTO**: CreateRequestDto with validation
- **Module**: TypeORM integration

### 6. **Donations Module** (`/donations`)

- **Entity**: Donation with Stripe integration and campaign relationship
- **DTO**: CreateDonationDto with validation
- **Module**: TypeORM integration

### 7. **SOS Module** (`/sos`)

- **Entity**: SOS calls with priority levels and location data
- **DTO**: CreateSOSDto with validation
- **Service**: CRUD with user relations
- **Controller**: REST endpoints

### 8. **Volunteer Module** (`/volunteer`)

- **Entity**: Volunteer with interests, skills, and user relationship
- **DTO**: CreateVolunteerDto with validation
- **Module**: TypeORM integration

### 9. **Connectivity Module** (`/connectivity`)

- **Entity**: WifiVoucher with status and expiry management
- **DTO**: CreateWifiVoucherDto with validation
- **Module**: TypeORM integration

### 10. **Review Module** (`/review`)

- **Entity**: Review with rating system for providers
- **DTO**: CreateReviewDto with validation
- **Module**: TypeORM integration

### 11. **Notification Module** (`/notification`)

- **Entity**: Notification with multiple types (EMAIL, SMS, PUSH)
- **DTO**: CreateNotificationDto with validation
- **Module**: TypeORM integration

### 12. **Admin Module** (`/admin`)

- Administrative module importing core modules
- Ready for admin-specific controllers and services

### 13. **Audit Module** (`/audit`)

- **Entity**: AuditLog for tracking all system changes
- **DTO**: CreateAuditLogDto with validation
- **Module**: TypeORM integration

## Key Features Implemented

### Entity Relationships

- User ↔ Provider (One-to-One)
- User ↔ Volunteer (One-to-One)
- Provider ↔ Campaign (One-to-Many)
- Campaign ↔ Donation (One-to-Many)
- User ↔ Request (One-to-Many)
- Provider ↔ Request (One-to-Many)
- User ↔ Review (One-to-Many)
- Provider ↔ Review (One-to-Many)

### Validation & DTOs

- Comprehensive input validation using class-validator
- OpenAPI documentation for all DTOs
- Type safety with TypeScript

### Database Integration

- TypeORM entities with proper column types
- Enum support for status fields
- UUID primary keys
- Timestamps (createdAt, updatedAt)
- Proper foreign key relationships

## Next Steps

- Implement authentication and authorization
- Add business logic to services
- Create comprehensive API endpoints
- Add unit and integration tests
- Implement real-time features with WebSocket
