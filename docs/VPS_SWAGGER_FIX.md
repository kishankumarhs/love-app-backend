# VPS Deployment Guide - Swagger Fix

## Issue

Swagger UI shows blank page with errors:

- 502 Bad Gateway for swagger assets
- SwaggerUIBundle is not defined
- COOP header warnings

## Solution Steps

### 1. Install SSL Certificate (Required)

```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot certonly --nginx -d lovesolutions.cloud -d www.lovesolutions.cloud

# Certificates will be in: /etc/letsencrypt/live/lovesolutions.cloud/
```

### 2. Configure Nginx

```bash
# Copy the VPS nginx config
sudo cp nginx-vps.conf /etc/nginx/sites-available/loveapp-backend

# Create symlink
sudo ln -s /etc/nginx/sites-available/loveapp-backend /etc/nginx/sites-enabled/

# Remove default config if exists
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### 3. Update Environment Variables

Create/update `.env` file on VPS:

```bash
NODE_ENV=production
HOST=0.0.0.0
PORT=3000
ALLOWED_ORIGINS=https://lovesolutions.cloud,https://www.lovesolutions.cloud
```

### 4. Restart Backend Service

```bash
# If using PM2
pm2 restart loveapp-backend

# If using systemd
sudo systemctl restart loveapp-backend
```

### 5. Verify Setup

1. Check backend is running:

```bash
curl http://localhost:3000/health
```

2. Check nginx is proxying:

```bash
curl https://lovesolutions.cloud/health
```

3. Access Swagger:

```
https://lovesolutions.cloud/api/docs
```

## Troubleshooting

### Still getting 502?

Check backend logs:

```bash
# PM2
pm2 logs loveapp-backend

# Systemd
sudo journalctl -u loveapp-backend -f
```

Check nginx logs:

```bash
sudo tail -f /var/log/nginx/loveapp-backend-error.log
```

### Swagger still blank?

1. Check browser console for errors
2. Verify CSP headers aren't blocking:

```bash
curl -I https://lovesolutions.cloud/api/docs
```

3. Test without helmet temporarily (in main.ts):

```typescript
// Comment out helmet in production for testing
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable temporarily
    crossOriginEmbedderPolicy: false,
  }),
);
```

### CORS errors?

Update `.env`:

```bash
ALLOWED_ORIGINS=https://lovesolutions.cloud,https://www.lovesolutions.cloud,http://lovesolutions.cloud
```

Then restart:

```bash
pm2 restart loveapp-backend
```

## Firewall Setup

```bash
# Allow HTTPS
sudo ufw allow 443/tcp

# Allow HTTP (for redirect)
sudo ufw allow 80/tcp

# Allow SSH
sudo ufw allow 22/tcp

# Enable firewall
sudo ufw enable
```

## PM2 Setup (if not using systemd)

```bash
# Install PM2
npm install -g pm2

# Start backend
cd /var/www/loveapp-backend
pm2 start dist/main.js --name loveapp-backend

# Save PM2 config
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

## Auto-renewal for SSL

Certbot sets up auto-renewal automatically. Test it:

```bash
sudo certbot renew --dry-run
```

## Final Checklist

- [ ] SSL certificate installed
- [ ] Nginx configuration updated
- [ ] Environment variables set
- [ ] Backend restarted
- [ ] Firewall configured
- [ ] HTTPS redirect working
- [ ] `/health` endpoint accessible
- [ ] Swagger UI loads at `/api/docs`
- [ ] API endpoints working with HTTPS

## Quick Fix Command Sequence

```bash
# 1. Get SSL
sudo certbot certonly --nginx -d lovesolutions.cloud

# 2. Setup Nginx
sudo cp nginx-vps.conf /etc/nginx/sites-available/loveapp-backend
sudo ln -s /etc/nginx/sites-available/loveapp-backend /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 3. Update backend env
echo "ALLOWED_ORIGINS=https://lovesolutions.cloud,https://www.lovesolutions.cloud" >> .env

# 4. Restart backend
pm2 restart loveapp-backend

# 5. Test
curl https://lovesolutions.cloud/health
```

Access: <https://lovesolutions.cloud/api/docs>
