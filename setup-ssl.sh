#!/bin/bash
# SSL Setup Script for VPS
# Run this on your VPS to get SSL certificate

set -e

echo "🔧 Setting up SSL certificate for lovesolutions.cloud..."

# Step 1: Create webroot directory
echo "📁 Creating webroot directory..."
sudo mkdir -p /var/www/html/.well-known/acme-challenge
sudo chown -R www-data:www-data /var/www/html

# Step 2: Backup existing nginx config
echo "💾 Backing up existing nginx config..."
if [ -f /etc/nginx/sites-enabled/loveapp-backend ]; then
    sudo cp /etc/nginx/sites-enabled/loveapp-backend /etc/nginx/sites-enabled/loveapp-backend.backup
    sudo rm /etc/nginx/sites-enabled/loveapp-backend
fi

# Step 3: Install temporary config for certbot
echo "⚙️  Installing temporary nginx config..."
sudo cp nginx-certbot.conf /etc/nginx/sites-available/loveapp-backend
sudo ln -s /etc/nginx/sites-available/loveapp-backend /etc/nginx/sites-enabled/

# Step 4: Test and reload nginx
echo "🔍 Testing nginx configuration..."
sudo nginx -t

echo "🔄 Reloading nginx..."
sudo systemctl reload nginx

# Step 5: Get SSL certificate using webroot method
echo "🔐 Requesting SSL certificate..."
sudo certbot certonly --webroot \
    -w /var/www/html \
    -d lovesolutions.cloud \
    -d www.lovesolutions.cloud \
    --email your-email@example.com \
    --agree-tos \
    --no-eff-email

# Step 6: Install production nginx config
echo "🚀 Installing production nginx config..."
sudo cp nginx-vps.conf /etc/nginx/sites-available/loveapp-backend
sudo systemctl reload nginx

echo "✅ SSL certificate installed successfully!"
echo "📚 Swagger should now be accessible at: https://lovesolutions.cloud/api/docs"
