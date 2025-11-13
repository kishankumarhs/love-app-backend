import { Transform } from 'class-transformer';

// Sanitize HTML and prevent XSS
export function SanitizeHtml() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]*>/g, '')
        .trim();
    }
    return value;
  });
}

// Sanitize SQL injection attempts
export function SanitizeSql() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
        /(--|\/\*|\*\/|;|'|")/gi,
      ];
      let sanitized = value;
      sqlPatterns.forEach((pattern) => {
        sanitized = sanitized.replace(pattern, '');
      });
      return sanitized.trim();
    }
    return value;
  });
}

// Normalize email
export function NormalizeEmail() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase().trim();
    }
    return value;
  });
}
