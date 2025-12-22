# LOVE App Backend - AI Agent Instructions

## 🎯 Project Overview

**LOVE App Backend** is a comprehensive community support platform built with **NestJS 11**, **TypeScript**, and **PostgreSQL**. It provides service provider discovery, emergency SOS system, donation management, volunteer coordination, and multi-language/timezone support with Firebase authentication.

**Tech Stack:**
- Framework: NestJS 11.0.0 (upgraded from mixed v10/v11)
- Language: TypeScript 5.1.3
- Database: PostgreSQL 13+ with TypeORM 0.3.27
- Authentication: Firebase Admin SDK + JWT + Passport
- Payment: Stripe integration
- Real-time: Socket.IO with JWT authentication
- Notifications: Nodemailer + Twilio
- Caching: Redis 6+
- Documentation: Swagger/OpenAPI
- Testing: Jest with E2E support
- Deployment: Docker + Nginx + PM2

**Domain:** lovesolutions.cloud (VPS: 31.97.141.223)

---

## 🏗️ Architecture & Module Structure

### Core Modules (Feature-based)

```
src/
├── auth/                # JWT + Firebase + OAuth (Google/Apple)
├── user/                # User management with 5-role RBAC
├── provider/            # Service provider registration & discovery
├── campaign/            # Fundraising campaigns with Stripe
├── sos/                 # Emergency SOS alerts with location tracking
├── donations/           # Payment processing via Stripe
├── volunteer/           # Volunteer coordination & wifi vouchers
├── requests/            # Help requests & referrals
├── review/              # Provider ratings & moderation
├── notification/        # Multi-channel (Email/SMS/WebSocket)
├── admin/               # Admin panel with analytics
├── audit/               # Audit logging for operations
├── security/            # Rate limiting & security features
├── connectivity/        # WiFi voucher management
├── i18n/                # Internationalization (EN/ES/FR)
├── common/              # Shared utilities, guards, decorators
├── config/              # Configuration files
└── migrations/          # TypeORM database migrations
```

### Key Architectural Patterns

1. **Modular Design**: Each feature is a self-contained NestJS module
2. **Layered Architecture**: Controller → Service → Repository (TypeORM)
3. **Dependency Injection**: NestJS DI container for all services
4. **Global Configuration**: ConfigModule.forRoot() with environment-based configs
5. **Global Pipes/Filters/Interceptors**: Applied at bootstrap in `main.ts`

---

## 🔐 Authentication & Authorization

### Authentication Strategy: Firebase + JWT

```typescript
// Firebase Strategy (Primary)
src/auth/strategies/firebase.strategy.ts  // Validates Firebase tokens
src/auth/guards/firebase.guard.ts         // Protects routes with Firebase auth

// JWT Strategy (Session Management)
src/auth/strategies/jwt.strategy.ts       // Validates JWT tokens
src/auth/guards/jwt.guard.ts              // JWT authentication guard

// OAuth Providers
src/auth/strategies/google.strategy.ts    // Google OAuth 2.0
```

### Role-Based Access Control (RBAC)

**User Roles** (defined in `src/user/entities/user.entity.ts`):
```typescript
enum UserRole {
  USER = 'USER',
  PROVIDER = 'PROVIDER',
  VOLUNTEER = 'VOLUNTEER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}
```

**Usage Pattern:**
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@ApiBearerAuth('JWT-auth')
async adminOnlyEndpoint() { /* ... */ }
```

### Guest User System

**Guest Guard** (`src/auth/guards/guest.guard.ts`):
- Allows unauthenticated access to specific endpoints (e.g., SOS emergency calls)
- Use `@AllowGuest()` decorator to permit guest access

---

## 📊 Database & TypeORM Conventions

### Entity Design Patterns

**Critical Convention: Avoid Circular Dependencies**

❌ **WRONG** (causes TypeScript compilation hang):
```typescript
// campaign.entity.ts
import { Provider } from '../../provider/entities/provider.entity';
@ManyToOne(() => Provider, (provider) => provider.campaigns)

// provider.entity.ts
import { Campaign } from '../../campaign/entities/campaign.entity';
@OneToMany(() => Campaign, (campaign) => campaign.provider)
```

✅ **CORRECT** (use string references):
```typescript
// campaign.entity.ts
@ManyToOne('Provider', (provider: any) => provider.campaigns)
provider: any;

// provider.entity.ts
@OneToMany('Campaign', (campaign: any) => campaign.provider)
campaigns: any[];
```

**Examples in Codebase:**
- `src/campaign/entities/campaign.entity.ts` → `src/provider/entities/provider.entity.ts`
- `src/requests/entities/referral.entity.ts` → `src/requests/entities/request.entity.ts`

### Entity Standards

```typescript
@Entity('table_name')  // Always specify table name explicitly
export class EntityName {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })  // Specify nullable explicitly
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Key Entities

- `users` - User accounts with roles and preferences
- `providers` - Service providers with location data
- `campaigns` - Fundraising campaigns with target/raised amounts
- `sos_calls` - Emergency alerts with priority levels
- `donations` - Payment transactions via Stripe
- `volunteers` - Volunteer profiles with skills/interests
- `reviews` - Provider ratings with moderation queue
- `notifications` - Multi-channel notification records
- `audit_logs` - Complete operation tracking
- `countries` - Reference data (fixed from 'counties' typo)

---

## 🚀 Development Workflows

### Essential Commands

```bash
# Development
npm run dev                    # Start dev server (nest start --watch)
npm run start:debug           # Debug mode with watch

# Database
npm run migration:run         # Run pending migrations
npm run migration:generate    # Generate migration from entity changes
docker-compose up db -d       # Start PostgreSQL only

# Testing
npm run test                  # Unit tests
npm run test:e2e              # E2E tests
npm run test:cov              # Coverage report
npm run test:all              # Run all tests (via scripts/test.sh)

# Docker
npm run docker:dev            # Start all services (app + db + redis + pgadmin)
npm run docker:build          # Build Docker image
npm run docker:down           # Stop all services

# Production
npm run build                 # Build for production
npm run start:prod            # Start production server
npm run deploy                # Deploy via scripts/deploy.sh
```

### Environment Configuration

**Required Environment Variables** (see `.env.example`):
```dotenv
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=love_app_dev

# JWT & Firebase
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Twilio (SMS)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Email
MAIL_HOST=smtp.gmail.com
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

### TypeScript Configuration

**Important Settings** (`tsconfig.json`):
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "allowSyntheticDefaultImports": true,  // Required for moment-timezone
    "esModuleInterop": true,                // Required for compression
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "maxNodeModuleJsDepth": 0,              // Prevent deep node_modules scanning
    "resolveJsonModule": true
  },
  "exclude": ["node_modules", "dist", "test", "**/*spec.ts"]
}
```

**Import Conventions:**
```typescript
// ✅ CORRECT (default imports)
import moment from 'moment-timezone';
import compression from 'compression';

// ❌ WRONG (namespace imports cause errors)
import * as moment from 'moment-timezone';
import * as compression from 'compression';
```

---

## 🔧 Common Module & Utilities

### Custom Decorators

```typescript
// Timezone & Language
@Timezone()      // Extract timezone from headers (src/common/decorators/timezone.decorator.ts)
@Language()      // Extract language from headers

// Rate Limiting
@RateLimit({ ttl: 60000, limit: 10 })  // Custom rate limits per endpoint

// Swagger Documentation
@ApiTags('Module Name')
@ApiBearerAuth('JWT-auth')
@ApiOperation({ summary: 'Description' })
@ApiResponse({ status: 200, description: 'Success' })
```

### Global Guards & Filters

**Applied in `src/app.module.ts`:**
```typescript
providers: [
  { provide: APP_GUARD, useClass: CustomThrottlerGuard },      // Rate limiting
  { provide: APP_FILTER, useClass: HttpExceptionFilter },      // Error handling
  { provide: APP_INTERCEPTOR, useClass: TransformInterceptor } // Response transformation
]
```

### Middleware

**SecurityMiddleware** (`src/common/middleware/security.middleware.ts`):
- Applied to all routes via `AppModule.configure()`
- Handles request sanitization and security headers

---

## 🌍 Internationalization (i18n)

### Supported Languages

- 🇺🇸 English (en) - Default
- 🇪🇸 Spanish (es)
- 🇫🇷 French (fr)

### Supported Timezones

18+ major timezones (Americas, Europe, Asia, Australia)

### Usage Pattern

```typescript
// Extract user's timezone/language from headers
async getEntity(
  @Timezone() timezone: string,
  @Language() language: string
) {
  // Automatically convert dates to user timezone
  // Return localized content based on language
}
```

**Headers:**
```http
Accept-Language: es
X-Timezone: America/Mexico_City
```

---

## 🛡️ Security Features

### Security Stack (Applied in `src/main.ts`)

```typescript
// Helmet - Security headers
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {...} : false,
  crossOriginEmbedderPolicy: false
}));

// Compression
app.use(compression());

// CORS Configuration
app.enableCors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
});

// Global Validation Pipe
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,                // Strip unknown properties
  forbidNonWhitelisted: true,     // Reject unknown properties
  transform: true,                 // Auto-transform types
  disableErrorMessages: process.env.NODE_ENV === 'production'
}));
```

### Rate Limiting

**Global Throttling** (via `@nestjs/throttler`):
- Default: 60 requests per minute
- Configurable per endpoint via `@RateLimit()` decorator

**Custom Guard**: `src/common/guards/rate-limit.guard.ts`

### Input Validation

**DTOs with class-validator:**
```typescript
import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;
}
```

---

## 📡 Real-time Features (WebSocket)

### Socket.IO Integration

**Configuration** (`src/notification/notification.gateway.ts`):
- JWT authentication for WebSocket connections
- Namespace: `/notifications`
- Events: `notification:new`, `sos:update`, `campaign:update`

**Usage Pattern:**
```typescript
@WebSocketGateway({ namespace: '/notifications', cors: true })
export class NotificationGateway {
  @WebSocketServer()
  server: Server;

  sendNotification(userId: string, data: any) {
    this.server.to(userId).emit('notification:new', data);
  }
}
```

---

## 🚢 Deployment & VPS Configuration

### VPS Hosting (Hostinger)

**Domain:** lovesolutions.cloud  
**IP:** 31.97.141.223  
**Process Manager:** PM2  
**Reverse Proxy:** Nginx

### Critical VPS Settings

**Trust Proxy** (required for VPS deployment):
```typescript
// src/main.ts
app.set('trust proxy', 1);  // Enable proxy trust for rate limiting
```

**Host Binding** (bind to all interfaces):
```typescript
const host = process.env.HOST || '0.0.0.0';  // Must be 0.0.0.0 for external access
await app.listen(port, host);
```

### Nginx Configuration

**Production Config** (`nginx-vps.conf`):
- HTTPS on port 443
- SSL certificates via Let's Encrypt/Certbot
- Reverse proxy to localhost:3000
- Special routing for Swagger UI (`/api/docs`)
- WebSocket support

**SSL Setup** (see `setup-ssl.sh`):
```bash
# Automated SSL certificate generation
sudo certbot certonly --nginx -d lovesolutions.cloud
```

**PM2 Process Management:**
```bash
pm2 start dist/main.js --name loveapp-backend
pm2 restart loveapp-backend
pm2 logs loveapp-backend
```

---

## 🧪 Testing Strategy

### Test Structure

```
test/
├── app.e2e-spec.ts       # E2E tests
└── jest-e2e.json         # E2E Jest config

src/
├── auth/auth.service.spec.ts      # Unit tests
├── donations/donations.service.spec.ts
└── */**.spec.ts
```

### Testing Conventions

```typescript
describe('AuthService', () => {
  let service: AuthService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [AuthService, /* mock dependencies */]
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should register user successfully', async () => {
    // Test implementation
  });
});
```

---

## 🔄 CI/CD Pipelines

### GitHub Actions Workflows

Located in `.github/workflows/`:

1. **ci.yml** - Continuous Integration
   - Linting (ESLint)
   - Unit tests (Jest)
   - E2E tests with PostgreSQL service
   - Docker image build
   - Code coverage upload (Codecov)

2. **cd.yml** - Production Deployment
   - Triggered on push to `main` branch
   - SSH deployment to VPS
   - PM2 restart

3. **staging.yml** - Staging Deployment
   - Triggered on push to `develop` branch

4. **codeql.yml** - Security Scanning
   - CodeQL analysis for vulnerabilities

5. **dependabot.yml** - Dependency Updates
   - Automated dependency updates

**See:** `docs/CI_CD_SETUP.md` for detailed setup

---

## 📚 API Documentation

### Swagger/OpenAPI

**URL:** `http://localhost:3000/api/docs` (dev) | `https://lovesolutions.cloud/api/docs` (prod)

**Configuration** (`src/main.ts`):
```typescript
const config = new DocumentBuilder()
  .setTitle('LOVE App API')
  .setVersion('1.0.0')
  .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT-auth')
  .addTag('Authentication')
  .addTag('Users')
  // ... other tags
  .build();

SwaggerModule.setup('api/docs', app, document, {
  swaggerOptions: { persistAuthorization: true },
  customCss: '.swagger-ui .topbar { display: none }'
});
```

### Health Check Endpoint

```http
GET /health

Response:
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 12345.67,
  "environment": "production",
  "version": "1.0.0"
}
```

---

## 🐛 Common Issues & Solutions

### 1. Circular Dependency Errors

**Problem:** TypeScript compilation hangs or circular dependency warnings

**Solution:** Use string references in TypeORM relationships
```typescript
// Instead of importing the entity class
@ManyToOne('EntityName', (entity: any) => entity.property)
```

### 2. Import Errors (moment-timezone, compression)

**Problem:** `Cannot find module` or namespace import errors

**Solution:** Use default imports
```typescript
import moment from 'moment-timezone';  // ✅
import compression from 'compression';  // ✅
```

### 3. Countries Table Not Fetching Data

**Problem:** Entity decorator had wrong table name ('counties' instead of 'countries')

**Solution:** Fixed in `src/user/entities/countires.entity.ts`:
```typescript
@Entity('countries')  // ✅ Correct table name
@Column({ nullable: true })  // ✅ Nullable constraint added
```

### 4. Swagger Blank on VPS

**Problem:** CSP blocking Swagger assets, 502 errors

**Solutions:**
- Disabled CSP in development: `contentSecurityPolicy: false`
- Added trust proxy: `app.set('trust proxy', 1)`
- Nginx special routing for `/api/docs`
- Use HTTPS in production

### 5. TypeScript Server Hanging

**Problem:** VS Code stuck "Initializing tsconfig.json"

**Causes:**
- Circular dependencies in entities
- Multiple lockfiles (package-lock.json + yarn.lock)
- Deep node_modules scanning

**Solutions:**
- Fix circular dependencies (use string references)
- Delete `yarn.lock` if using npm
- Set `maxNodeModuleJsDepth: 0` in tsconfig.json

### 6. Git Repository Corruption

**Problem:** `error: unable to read tree` or invalid reference files

**Solution:** Remove invalid references:
```bash
find .git/refs -name "*\ *" -type f -delete
```

---

## 📖 Documentation Resources

### Key Documentation Files

- `README.md` - Project overview & quick start
- `docs/AUTHENTICATION.md` - Authentication implementation guide
- `docs/MODULE_STRUCTURE.md` - Module organization
- `docs/CI_CD_SETUP.md` - CI/CD pipeline setup
- `docs/INTERNATIONALIZATION.md` - i18n & timezone guide
- `docs/VPS_SWAGGER_FIX.md` - VPS deployment troubleshooting
- `SECURITY.md` - Security features & best practices
- `postman/README.md` - Postman collection with auto-authentication

### API Endpoint Documentation

Located in `docs/`:
- `01-authentication-api.md`
- `02-user-management-api.md`
- `03-provider-system-api.md`
- `04-campaign-management-api.md`
- `05-sos-emergency-system-api.md`
- `06-donation-system-api.md`
- `07-volunteer-system-api.md`
- `08-review-system-api.md`
- `09-notification-system-api.md`
- `10-realtime-features-api.md`
- `11-admin-panel-api.md`
- `12-analytics-dashboard-api.md`

---

## 🎯 Coding Guidelines for AI Agents

### When Adding New Features

1. **Create Module Structure:**
   ```bash
   nest generate module feature-name
   nest generate service feature-name
   nest generate controller feature-name
   ```

2. **Follow Entity Conventions:**
   - Use string references for circular dependencies
   - Explicitly set `nullable: true` when needed
   - Specify table name in `@Entity('table_name')`
   - Add `@CreateDateColumn()` and `@UpdateDateColumn()`

3. **Add Swagger Documentation:**
   - `@ApiTags('Module Name')` on controller
   - `@ApiOperation()` on each endpoint
   - `@ApiBearerAuth('JWT-auth')` for protected routes
   - `@ApiProperty()` on all DTO properties

4. **Implement Security:**
   - Use `@UseGuards(JwtAuthGuard)` for authenticated routes
   - Add `@Roles()` decorator for role-based access
   - Validate all inputs with DTOs and class-validator
   - Sanitize user input in services

5. **Add Tests:**
   - Unit tests for services: `*.service.spec.ts`
   - E2E tests for critical flows
   - Mock external dependencies (Stripe, Twilio, etc.)

6. **Update Documentation:**
   - Add endpoint documentation in `docs/`
   - Update README.md with new features
   - Add Postman collection examples

### When Fixing Bugs

1. **Check for Circular Dependencies:**
   - Search for entity imports in other entities
   - Replace with string references if needed

2. **Verify Import Statements:**
   - Use default imports for moment-timezone, compression
   - Ensure `esModuleInterop: true` in tsconfig.json

3. **Validate Entity-Table Alignment:**
   - Check `@Entity('table_name')` matches actual table
   - Verify column types match database schema
   - Add `nullable: true` if column allows NULL

4. **Test Locally Before Deployment:**
   - Run `npm run test` for unit tests
   - Run `npm run test:e2e` for E2E tests
   - Test with Docker: `npm run docker:dev`

### When Deploying to VPS

1. **Environment Variables:**
   - Create `.env.production` with production values
   - Never commit secrets to Git

2. **Build & Deploy:**
   ```bash
   npm run build
   npm run migration:run
   pm2 restart loveapp-backend
   ```

3. **SSL Certificate:**
   - Ensure nginx-certbot.conf is active for cert generation
   - Switch to nginx-vps.conf after cert obtained

4. **Monitoring:**
   ```bash
   pm2 logs loveapp-backend
   pm2 status
   curl https://lovesolutions.cloud/health
   ```

---

## 🚨 Emergency Contacts & Support

- **Repository:** GitHub (kishankumarhs/love-app-backend)
- **CI/CD:** GitHub Actions
- **Hosting:** Hostinger VPS (31.97.141.223)
- **Domain:** lovesolutions.cloud
- **Email:** support@loveapp.com

---

## 📝 Version Information

- **NestJS:** 11.0.0
- **TypeScript:** 5.1.3
- **Node.js:** 18+
- **PostgreSQL:** 13+
- **Redis:** 6+
- **TypeORM:** 0.3.27

---

**Last Updated:** January 2024  
**Maintained By:** LOVE App Development Team
