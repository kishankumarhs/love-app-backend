# VPS Deployment Guide - Swagger Fix

## Issue

Swagger UI shows blank page with errors:

- 502 Bad Gateway for swagger assets
- SwaggerUIBundle is not defined
- COOP header warnings

## Solution Steps

### 1. Prepare for SSL Certificate

On your VPS, create the webroot directory:

```bash
sudo mkdir -p /var/www/html/.well-known/acme-challenge
sudo chown -R www-data:www-data /var/www/html
```

### 2. Install Temporary Nginx Config (for SSL verification)

```bash
# Remove any existing config
sudo rm -f /etc/nginx/sites-enabled/loveapp-backend

# Install temporary config for certbot
sudo cp nginx-certbot.conf /etc/nginx/sites-available/loveapp-backend
sudo ln -s /etc/nginx/sites-available/loveapp-backend /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Get SSL Certificate

```bash
sudo certbot certonly --webroot \
    -w /var/www/html \
    -d lovesolutions.cloud \
    -d www.lovesolutions.cloud \
    --email your-email@example.com \
    --agree-tos
```

**Important:** Replace `your-email@example.com` with your actual email.

### 4. Install Production Nginx Config

After SSL certificate is obtained:

```bash
# Install production config
sudo cp nginx-vps.conf /etc/nginx/sites-available/loveapp-backend

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### 5. Update Environment Variables

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

**Run these commands on your VPS:**

```bash
# Step 1: Prepare webroot
sudo mkdir -p /var/www/html/.well-known/acme-challenge
sudo chown -R www-data:www-data /var/www/html

# Step 2: Install temporary nginx config
sudo rm -f /etc/nginx/sites-enabled/loveapp-backend
sudo cp nginx-certbot.conf /etc/nginx/sites-available/loveapp-backend
sudo ln -s /etc/nginx/sites-available/loveapp-backend /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Step 3: Get SSL certificate (REPLACE your-email@example.com!)
sudo certbot certonly --webroot \
    -w /var/www/html \
    -d lovesolutions.cloud \
    -d www.lovesolutions.cloud \
    --email your-email@example.com \
    --agree-tos

# Step 4: Install production config
sudo cp nginx-vps.conf /etc/nginx/sites-available/loveapp-backend
sudo nginx -t && sudo systemctl reload nginx

# Step 5: Update backend env
echo "ALLOWED_ORIGINS=https://lovesolutions.cloud,https://www.lovesolutions.cloud" >> .env

# Step 6: Restart backend
pm2 restart loveapp-backend

# Step 7: Test
curl https://lovesolutions.cloud/health
```

**Or use the automated script:**

```bash
chmod +x setup-ssl.sh
# Edit setup-ssl.sh and replace your-email@example.com
./setup-ssl.sh
```

Access: <https://lovesolutions.cloud/api/docs>
