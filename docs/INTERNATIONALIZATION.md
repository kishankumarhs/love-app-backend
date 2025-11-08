# Internationalization (i18n) & Multi-Timezone Support

## Overview

The Love App Backend supports multiple languages and timezones to serve users globally. This document outlines the implementation and usage of internationalization features.

## 🌍 Supported Languages

### Current Languages

- **English (en)** - Default language
- **Spanish (es)** - Español
- **French (fr)** - Français

### Language Configuration

```typescript
// Supported languages with metadata
const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
];
```

## 🕐 Supported Timezones

### Major Timezones

- **UTC** - Coordinated Universal Time (Default)
- **America/New_York** - Eastern Time
- **America/Chicago** - Central Time
- **America/Denver** - Mountain Time
- **America/Los_Angeles** - Pacific Time
- **America/Mexico_City** - Mexico Central Time
- **America/Sao_Paulo** - Brazil Time
- **Europe/London** - Greenwich Mean Time
- **Europe/Paris** - Central European Time
- **Europe/Berlin** - Central European Time
- **Europe/Madrid** - Central European Time
- **Europe/Rome** - Central European Time
- **Asia/Tokyo** - Japan Standard Time
- **Asia/Shanghai** - China Standard Time
- **Asia/Kolkata** - India Standard Time
- **Asia/Dubai** - Gulf Standard Time
- **Australia/Sydney** - Australian Eastern Time
- **Pacific/Auckland** - New Zealand Time

## 🔧 Implementation

### 1. Language Detection

The system detects user language through multiple methods:

```typescript
// Priority order:
1. Query parameter: ?lang=es
2. Accept-Language header
3. User profile language setting
4. Default: 'en'
```

### 2. Timezone Detection

User timezone is detected through:

```typescript
// Priority order:
1. X-Timezone header
2. User profile timezone setting
3. Default: 'UTC'
```

### 3. Database Schema

```sql
-- Users table with i18n fields
ALTER TABLE users
ADD COLUMN timezone VARCHAR(50) DEFAULT 'UTC' NOT NULL,
ADD COLUMN language VARCHAR(5) DEFAULT 'en' NOT NULL;
```

### 4. API Usage

#### Setting Language

```bash
# Via query parameter
GET /api/campaigns?lang=es

# Via header
curl -H "Accept-Language: es" /api/campaigns
```

#### Setting Timezone

```bash
# Via header
curl -H "X-Timezone: America/New_York" /api/campaigns
```

#### Registration with Preferences

```json
POST /auth/register
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "Juan",
  "lastName": "Pérez",
  "timezone": "America/Mexico_City",
  "language": "es"
}
```

## 📝 Translation Files

### Structure

```text
src/i18n/translations/
├── en.json    # English translations
├── es.json    # Spanish translations
└── fr.json    # French translations
```

### Translation Keys

```json
{
  "auth": {
    "login_success": "Login successful",
    "login_failed": "Invalid credentials"
  },
  "validation": {
    "required": "This field is required",
    "email_invalid": "Please provide a valid email address"
  },
  "errors": {
    "not_found": "Resource not found",
    "server_error": "Internal server error"
  }
}
```

### Usage in Code

```typescript
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class AuthService {
  constructor(private readonly i18n: I18nService) {}

  async login(loginDto: LoginDto, lang: string) {
    try {
      // Login logic
      return {
        message: await this.i18n.translate('auth.login_success', { lang }),
      };
    } catch (error) {
      throw new UnauthorizedException(
        await this.i18n.translate('auth.login_failed', { lang }),
      );
    }
  }
}
```

## 🕒 Timezone Handling

### Automatic Conversion

All datetime fields are automatically converted to user's timezone in API responses:

```typescript
// Input (UTC): 2024-01-01T12:00:00Z
// Output (America/New_York): 2024-01-01T07:00:00-05:00
```

### Timezone Service

```typescript
@Injectable()
export class TimezoneService {
  convertToTimezone(date: Date, timezone: string): string;
  convertToUTC(date: Date, timezone: string): Date;
  getCurrentTimeInTimezone(timezone: string): string;
  formatDateForTimezone(date: Date, timezone: string, format: string): string;
  isValidTimezone(timezone: string): boolean;
}
```

### Date Fields Converted

- `createdAt`
- `updatedAt`
- `startDate`
- `endDate`
- `appointmentDate`
- `completedAt`
- `resolvedAt`

## 🎯 API Endpoints

### Get Supported Languages

```bash
GET /i18n/languages
```

Response:

```json
{
  "languages": [
    { "code": "en", "name": "English", "nativeName": "English" },
    { "code": "es", "name": "Spanish", "nativeName": "Español" },
    { "code": "fr", "name": "French", "nativeName": "Français" }
  ],
  "default": "en"
}
```

### Get Supported Timezones

```bash
GET /i18n/timezones
```

Response:

```json
{
  "timezones": ["UTC", "America/New_York", "Europe/London", "Asia/Tokyo"],
  "default": "UTC"
}
```

### Get Current Time

```bash
GET /i18n/time?timezone=America/New_York
```

Response:

```json
{
  "timezone": "America/New_York",
  "currentTime": "2024-01-01T07:00:00-05:00",
  "utcTime": "2024-01-01T12:00:00.000Z",
  "offset": -300
}
```

## 🔄 Interceptors & Decorators

### Timezone Interceptor

Automatically converts all date fields in responses to user's timezone:

```typescript
@UseInterceptors(TimezoneInterceptor)
@Controller('campaigns')
export class CampaignController {
  // All responses will have dates converted to user's timezone
}
```

### Custom Decorators

```typescript
// Extract timezone from request
@Get('campaigns')
getCampaigns(@Timezone() timezone: string) {
  // timezone = 'America/New_York'
}

// Extract language from request
@Get('campaigns')
getCampaigns(@Language() language: string) {
  // language = 'es'
}
```

## 🌐 Frontend Integration

### Setting Headers

```javascript
// Set language preference
axios.defaults.headers.common['Accept-Language'] = 'es';

// Set timezone
axios.defaults.headers.common['X-Timezone'] = 'America/Mexico_City';
```

### Detecting User Timezone

```javascript
// Get user's timezone
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
// Result: "America/New_York"

// Get user's language
const language = navigator.language.split('-')[0];
// Result: "es"
```

## 📱 Mobile App Integration

### React Native

```javascript
import { getLocales, getTimeZone } from 'react-native-localize';

// Get device language
const locales = getLocales();
const language = locales[0].languageCode; // 'es'

// Get device timezone
const timezone = getTimeZone(); // 'America/Mexico_City'

// Set in API client
apiClient.defaults.headers.common['Accept-Language'] = language;
apiClient.defaults.headers.common['X-Timezone'] = timezone;
```

## 🔍 Validation

### Timezone Validation

```typescript
// Valid timezone formats
✅ 'UTC'
✅ 'America/New_York'
✅ 'Europe/London'
❌ 'Invalid/Timezone'
❌ 'EST' (deprecated)
```

### Language Validation

```typescript
// Valid language codes (ISO 639-1)
✅ 'en'
✅ 'es'
✅ 'fr'
✅ 'en-US' (with country code)
❌ 'english'
❌ 'ESP'
```

## 🚀 Adding New Languages

### 1. Create Translation File

```bash
# Create new translation file
touch src/i18n/translations/de.json
```

### 2. Add Translations

```json
{
  "auth": {
    "login_success": "Anmeldung erfolgreich",
    "login_failed": "Ungültige Anmeldedaten"
  }
}
```

### 3. Update Language List

```typescript
// Update supported languages
const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' }, // New
];
```

## 📊 Best Practices

### 1. Always Store UTC in Database

```typescript
// ✅ Store in UTC
const user = {
  createdAt: new Date().toISOString(), // UTC
  timezone: 'America/New_York', // User preference
};

// ❌ Don't store in user timezone
const user = {
  createdAt: moment().tz('America/New_York').format(), // Wrong!
};
```

### 2. Convert on Display

```typescript
// ✅ Convert for display
const displayTime = timezoneService.convertToTimezone(
  user.createdAt,
  user.timezone
);

// ❌ Don't convert in database queries
SELECT * FROM users WHERE created_at > '2024-01-01 EST'; // Wrong!
```

### 3. Handle Missing Translations

```typescript
// ✅ Provide fallback
const message = await this.i18n.translate('auth.login_success', {
  lang,
  defaultValue: 'Login successful', // Fallback
});
```

### 4. Validate User Input

```typescript
// ✅ Validate timezone
if (!timezoneService.isValidTimezone(timezone)) {
  timezone = 'UTC'; // Fallback to UTC
}
```

## 🔧 Configuration

### Environment Variables

```env
# Default language
DEFAULT_LANGUAGE=en

# Default timezone
DEFAULT_TIMEZONE=UTC

# Supported languages (comma-separated)
SUPPORTED_LANGUAGES=en,es,fr

# Enable timezone conversion
ENABLE_TIMEZONE_CONVERSION=true
```

### I18n Module Configuration

```typescript
I18nModule.forRoot({
  fallbackLanguage: 'en',
  loaderOptions: {
    path: path.join(__dirname, '/translations/'),
    watch: true,
  },
  resolvers: [
    { use: QueryResolver, options: ['lang'] },
    { use: HeaderResolver, options: ['accept-language'] },
    AcceptLanguageResolver,
  ],
});
```

This comprehensive internationalization system ensures the Love App can serve users globally with proper language and timezone support.
