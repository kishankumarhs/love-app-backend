# Love App Backend 💝

<p align="center">
  ![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
  ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
  ![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
  ![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)
</p>

<p align="center">
  ![CI](https://github.com/kishankumarhs/love-app-backend/workflows/CI/badge.svg)
  ![CD](https://github.com/kishankumarhs/love-app-backend/workflows/CD%20-%20Deploy%20to%20Production/badge.svg)
  ![CodeQL](https://github.com/kishankumarhs/love-app-backend/workflows/CodeQL%20Security%20Scan/badge.svg)
  ![License](https://img.shields.io/badge/license-UNLICENSED-blue.svg)
</p>

<p align="center">
  ![CI](https://github.com/kishankumarhs/love-app-backend/workflows/CI/badge.svg)
  ![CD](https://github.com/kishankumarhs/love-app-backend/workflows/CD%20-%20Deploy%20to%20Production/badge.svg)
  ![CodeQL](https://github.com/kishankumarhs/love-app-backend/workflows/CodeQL%20Security%20Scan/badge.svg)
</p>

<p align="center">
  A comprehensive community support platform backend built with NestJS, featuring provider discovery, emergency SOS system, donation management, volunteer coordination, and multi-language/timezone support.
</p>

## 🌟 Features

### Core Functionality

- 🔐 **Authentication & Authorization** - JWT-based auth with 5-role RBAC system
- 👥 **User Management** - Complete user profiles with preferences and feedback
- 🏥 **Provider Discovery** - Service provider registration and location-based search
- 📢 **Campaign Management** - Fundraising campaigns with goal tracking
- 🆘 **Emergency SOS System** - Real-time emergency alerts with location tracking
- 💰 **Donation Processing** - Stripe integration with payment management
- 🤝 **Volunteer Coordination** - Application system with opportunity matching
- ⭐ **Review System** - Provider ratings with moderation queue
- 📱 **Real-time Notifications** - Multi-channel notifications (Email, SMS, WebSocket)
- 👨‍💼 **Admin Panel** - Comprehensive management with analytics dashboard

### Advanced Features

- 🛡️ **Enterprise Security** - Rate limiting, input validation, security headers
- 🌍 **Internationalization** - Multi-language (EN/ES/FR) and timezone support
- 📊 **Analytics & Reporting** - Automated metrics with cron jobs
- 🔍 **Audit Logging** - Complete audit trail for all operations
- 📡 **Real-time Updates** - WebSocket integration with JWT authentication
- 🐳 **Docker Ready** - Complete containerization with orchestration
- 📚 **API Documentation** - Comprehensive Swagger/OpenAPI docs
- 🧪 **Testing Framework** - Jest unit tests with E2E testing setup

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 13+
- Redis 6+ (for caching)
- Docker & Docker Compose (optional)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd love-app-backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run migration:run

# Start development server
npm run start:dev
```

### Docker Setup

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📖 Documentation

### Quick Links

- 📋 **[Feature Verification](./FEATURE_VERIFICATION.md)** - Complete feature checklist
- 🛡️ **[Security Documentation](./SECURITY.md)** - Security features and best practices
- 🌍 **[Internationalization Guide](./INTERNATIONALIZATION.md)** - Multi-language and timezone support
- 🧪 **[Postman Collection](./postman/README.md)** - API testing with auto-authentication
- 📚 **[API Documentation](./docs/)** - Comprehensive API guides

### API Documentation

- **[01. Authentication](./docs/01-authentication-api.md)** - User auth and JWT management
- **[02. User Management](./docs/02-user-management-api.md)** - User profiles and preferences
- **[03. Provider System](./docs/03-provider-system-api.md)** - Service provider management
- **[04. Campaign Management](./docs/04-campaign-management-api.md)** - Fundraising campaigns
- **[05. SOS Emergency System](./docs/05-sos-emergency-system-api.md)** - Emergency alerts
- **[06. Donation System](./docs/06-donation-system-api.md)** - Payment processing
- **[07. Volunteer System](./docs/07-volunteer-system-api.md)** - Volunteer coordination
- **[08. Review System](./docs/08-review-system-api.md)** - Rating and feedback
- **[09. Notification System](./docs/09-notification-system-api.md)** - Multi-channel notifications
- **[10. Real-time Features](./docs/10-realtime-features-api.md)** - WebSocket integration
- **[11. Admin Panel](./docs/11-admin-panel-api.md)** - Administrative features
- **[12. Analytics Dashboard](./docs/12-analytics-dashboard-api.md)** - Metrics and reporting

## 🏗️ Architecture

### Tech Stack

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport
- **Payment**: Stripe integration
- **Real-time**: Socket.IO with JWT auth
- **Notifications**: Nodemailer + Twilio
- **Caching**: Redis
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest with E2E support
- **Deployment**: Docker with Nginx

### Project Structure

```
src/
├── admin/           # Admin panel with analytics
├── auth/            # Authentication & authorization
├── campaign/        # Campaign management
├── common/          # Shared utilities & decorators
├── config/          # Configuration files
├── donations/       # Payment processing
├── i18n/           # Internationalization
├── migrations/      # Database migrations
├── notification/    # Multi-channel notifications
├── provider/        # Service provider management
├── requests/        # Help requests & referrals
├── review/          # Review & rating system
├── security/        # Security features
├── sos/            # Emergency SOS system
├── user/           # User management
└── volunteer/      # Volunteer coordination
```

## 🔧 Configuration

### Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=loveapp

# JWT
JWT_SECRET=your-super-secure-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SMS
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Security
BCRYPT_ROUNDS=12
THROTTLE_TTL=60000
THROTTLE_LIMIT=20
```

## 🧪 Testing

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

### Postman Testing

```bash
# Import collection and environment
# Files: ./postman/Love-App-Backend.postman_collection.json
#        ./postman/Love-App-Environment.postman_environment.json

# Auto-authentication script included
# See: ./postman/README.md
```

## 🚀 Deployment

### Production Deployment

```bash
# Build application
npm run build

# Run migrations
npm run migration:run

# Start production server
npm run start:prod
```

### Docker Production

```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up -d

# Health check
curl http://localhost:3000/health
```

### Deployment Script

```bash
# Automated deployment
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

## 📊 API Endpoints

### Core Endpoints

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /users/profile` - Get user profile
- `GET /providers/search` - Search providers
- `POST /campaigns` - Create campaign
- `POST /sos` - Create SOS alert
- `POST /donations` - Process donation
- `POST /volunteers/apply` - Apply as volunteer
- `GET /notifications` - Get notifications
- `GET /admin/analytics/dashboard` - Admin dashboard

### Internationalization

- `GET /i18n/languages` - Supported languages
- `GET /i18n/timezones` - Supported timezones
- `GET /i18n/time?timezone=America/New_York` - Current time

### Health & Monitoring

- `GET /health` - Health check
- `GET /api/docs` - Swagger documentation

## 🛡️ Security Features

- ✅ **Rate Limiting** - Global and endpoint-specific limits
- ✅ **Input Validation** - Comprehensive validation with sanitization
- ✅ **XSS Protection** - HTML sanitization and CSP headers
- ✅ **SQL Injection Prevention** - Parameterized queries
- ✅ **CORS Configuration** - Environment-specific origins
- ✅ **Security Headers** - Helmet.js integration
- ✅ **Password Security** - bcrypt with strong requirements
- ✅ **JWT Security** - Short-lived tokens with refresh
- ✅ **Audit Logging** - Complete operation tracking

## 🌍 Internationalization

### Supported Languages

- 🇺🇸 **English (en)** - Default
- 🇪🇸 **Spanish (es)** - Español
- 🇫🇷 **French (fr)** - Français

### Supported Timezones

- 🌍 **18+ Major Timezones** - Americas, Europe, Asia, Australia
- 🕐 **Automatic Conversion** - All dates converted to user timezone
- 📍 **Location Detection** - Via headers and user preferences

### Usage

```bash
# Set language
curl -H "Accept-Language: es" /api/campaigns

# Set timezone
curl -H "X-Timezone: America/Mexico_City" /api/campaigns
```

## 📈 Performance & Monitoring

### Metrics

- Response time monitoring
- Error rate tracking
- Database query performance
- Rate limit violations
- User activity analytics

### Health Checks

```bash
# Application health
GET /health

# Database connectivity
# Redis connectivity
# External service status
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow security guidelines
- Add translations for new features

## 🚀 CI/CD

This project includes comprehensive CI/CD pipelines using GitHub Actions:

- ✅ **Continuous Integration** - Automated testing, linting, and builds
- 🚀 **Continuous Deployment** - Automated deployments to staging and production
- 🔒 **Security Scanning** - CodeQL analysis and dependency updates
- 📦 **Docker Support** - Automated image builds and deployments

For detailed setup instructions, see [CI/CD Setup Guide](./docs/CI_CD_SETUP.md).

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 **Email**: <support@loveapp.com>
- 📚 **Documentation**: [API Docs](./docs/)
- 🐛 **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)

## 🙏 Acknowledgments

- Built with [NestJS](https://nestjs.com/)
- Powered by [TypeScript](https://www.typescriptlang.org/)
- Database by [PostgreSQL](https://www.postgresql.org/)
- Payments by [Stripe](https://stripe.com/)
- Notifications by [Twilio](https://www.twilio.com/)

---

<p align="center">
  Made with ❤️ for community support and social impact
</p>
