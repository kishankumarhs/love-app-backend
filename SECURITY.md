# Security Features Documentation

## Overview

This document outlines the comprehensive security features implemented in the Love App Backend to protect against common vulnerabilities and ensure data security.

## 🛡️ Security Features Implemented

### 1. Rate Limiting & Throttling

- **Global Rate Limiting**: 20 requests/minute, 100 requests/10 minutes, 500 requests/hour
- **Endpoint-Specific Limits**:
  - Registration: 3 attempts per 5 minutes
  - Login: 5 attempts per 15 minutes
  - Password Reset: 3 attempts per hour
- **IP + User-based Tracking**: Prevents abuse from authenticated users
- **Custom Throttler Guard**: Enhanced tracking and error messages

### 2. Input Validation & Sanitization

- **Class Validator**: Comprehensive input validation on all DTOs
- **HTML Sanitization**: Prevents XSS attacks by stripping HTML tags
- **SQL Injection Prevention**: Input sanitization and parameterized queries
- **Email Normalization**: Consistent email formatting
- **Phone Number Validation**: International phone number format validation
- **Password Strength**: Enforced complex password requirements

### 3. Authentication & Authorization

- **JWT Tokens**: Secure token-based authentication
- **Role-Based Access Control (RBAC)**: 5 user roles with granular permissions
- **Token Expiration**: Short-lived access tokens with refresh mechanism
- **Secure Password Hashing**: bcrypt with salt rounds
- **Session Management**: Proper logout and token invalidation

### 4. HTTP Security Headers

- **Helmet.js Integration**: Comprehensive security headers
- **Content Security Policy (CSP)**: Prevents XSS and code injection
- **HSTS**: HTTP Strict Transport Security for HTTPS enforcement
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **Referrer Policy**: Controls referrer information

### 5. CORS Configuration

- **Environment-Specific Origins**: Production vs development origins
- **Credential Support**: Secure cookie handling
- **Method Restrictions**: Only allowed HTTP methods
- **Header Control**: Specific allowed and exposed headers
- **Preflight Caching**: Optimized CORS preflight requests

### 6. Data Protection

- **Environment Variables**: Sensitive data in environment files
- **Database Security**: Connection encryption and parameterized queries
- **File Upload Security**: Type validation and size limits
- **API Key Management**: Secure external service integration
- **PII Handling**: Proper handling of personally identifiable information

### 7. Error Handling & Logging

- **Global Exception Filter**: Consistent error responses
- **Security Logging**: Request/response logging with security events
- **Error Message Sanitization**: No sensitive data in error responses
- **Audit Trail**: Comprehensive logging for security events

### 8. API Security

- **Request Size Limits**: Prevents DoS attacks via large payloads
- **Compression**: Gzip compression for performance
- **API Versioning**: Structured API versioning for security updates
- **Swagger Security**: API documentation with security schemes
- **Health Checks**: Monitoring endpoints for system status

## 🔧 Configuration

### Environment Variables

```env
# Security
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=20

# CORS
CORS_ORIGIN=https://loveapp.com,https://www.loveapp.com
CORS_CREDENTIALS=true

# Database Security
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=true
```

### Rate Limiting Configuration

```typescript
// Global rate limits
{
  name: 'short',
  ttl: 60000,    // 1 minute
  limit: 20,     // 20 requests
},
{
  name: 'medium',
  ttl: 600000,   // 10 minutes
  limit: 100,    // 100 requests
},
{
  name: 'long',
  ttl: 3600000,  // 1 hour
  limit: 500,    // 500 requests
}
```

### Security Headers

```typescript
helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});
```

## 🚨 Security Best Practices

### 1. Password Security

- Minimum 8 characters
- Must contain uppercase, lowercase, number, and special character
- bcrypt hashing with 12 salt rounds
- No password in logs or error messages

### 2. Token Management

- Short-lived access tokens (15 minutes)
- Refresh tokens with longer expiry (7 days)
- Secure token storage recommendations
- Token blacklisting on logout

### 3. API Security

- All endpoints require authentication (except public ones)
- Role-based access control on sensitive endpoints
- Input validation on all request bodies
- Output sanitization to prevent data leaks

### 4. Database Security

- Parameterized queries to prevent SQL injection
- Connection encryption (SSL/TLS)
- Minimal database permissions
- Regular security updates

### 5. Monitoring & Alerting

- Failed authentication attempts logging
- Rate limit violations tracking
- Suspicious activity detection
- Security event notifications

## 🔍 Security Testing

### Automated Security Checks

```bash
# Install security audit tools
npm install -g audit-ci
npm install --save-dev @types/helmet

# Run security audit
npm audit
npm run test:security

# Check for vulnerabilities
npm audit --audit-level moderate
```

### Manual Security Testing

1. **Authentication Testing**
   - Test password strength requirements
   - Verify JWT token expiration
   - Test rate limiting on login attempts

2. **Authorization Testing**
   - Verify role-based access control
   - Test endpoint permissions
   - Check for privilege escalation

3. **Input Validation Testing**
   - Test XSS prevention
   - Verify SQL injection protection
   - Check file upload security

4. **Rate Limiting Testing**
   - Test global rate limits
   - Verify endpoint-specific limits
   - Check rate limit bypass attempts

## 🚀 Deployment Security

### Production Checklist

- [ ] Environment variables properly set
- [ ] HTTPS enforced (SSL/TLS certificates)
- [ ] Database connections encrypted
- [ ] Rate limiting configured
- [ ] Security headers enabled
- [ ] CORS properly configured
- [ ] Logging and monitoring active
- [ ] Regular security updates scheduled

### Infrastructure Security

- Use HTTPS/TLS for all communications
- Implement Web Application Firewall (WAF)
- Regular security patches and updates
- Database encryption at rest
- Secure backup procedures
- Network segmentation and firewalls

## 📊 Security Monitoring

### Key Metrics to Monitor

- Failed authentication attempts
- Rate limit violations
- Unusual API usage patterns
- Error rates and types
- Response times (potential DoS indicators)
- Database query patterns

### Alerting Thresholds

- More than 10 failed logins per minute
- Rate limit violations exceeding 100/hour
- Error rates above 5%
- Response times above 2 seconds
- Unusual geographic access patterns

## 🔄 Security Updates

### Regular Security Tasks

- Weekly dependency updates
- Monthly security audit reviews
- Quarterly penetration testing
- Annual security architecture review
- Continuous monitoring and alerting

### Incident Response

1. **Detection**: Automated monitoring and alerting
2. **Assessment**: Evaluate severity and impact
3. **Containment**: Isolate affected systems
4. **Eradication**: Remove threats and vulnerabilities
5. **Recovery**: Restore normal operations
6. **Lessons Learned**: Update security measures

## 📚 Security Resources

### Documentation

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NestJS Security](https://docs.nestjs.com/security/authentication)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)

### Tools

- [Helmet.js](https://helmetjs.github.io/) - Security headers
- [bcrypt](https://www.npmjs.com/package/bcrypt) - Password hashing
- [class-validator](https://github.com/typestack/class-validator) - Input validation
- [rate-limiter-flexible](https://www.npmjs.com/package/rate-limiter-flexible) - Advanced rate limiting

This comprehensive security implementation ensures the Love App Backend is protected against common vulnerabilities and follows industry best practices for API security.
