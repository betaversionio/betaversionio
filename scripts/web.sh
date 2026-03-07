#!/bin/bash
set -e

# ============================================================
# System updates
# ============================================================
sudo apt update && sudo apt upgrade -y

# ============================================================
# Node.js, pm2
# ============================================================
sudo apt install -y curl ca-certificates
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm -g i pm2

# ============================================================
# Nginx + Certbot
# ============================================================
sudo apt install -y nginx certbot python3-certbot-nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Copy nginx config and enable site
sudo cp nginx/web.conf /etc/nginx/sites-available/wildcard.betaversion.io
sudo ln -sf /etc/nginx/sites-available/wildcard.betaversion.io /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# SSL certificate (wildcard + bare domain, requires DNS challenge)
sudo apt install -y python3-certbot-dns-cloudflare
echo "dns_cloudflare_api_token = YOUR_TOKEN_HERE" > ~/.cloudflare.ini
chmod 600 ~/.cloudflare.ini
sudo certbot certonly --dns-cloudflare --dns-cloudflare-credentials ~/.cloudflare.ini -d "*.betaversion.io" -d "betaversion.io"
sudo certbot --nginx -d "*.betaversion.io" -d "betaversion.io"

# ============================================================
# Firewall rules
# ============================================================
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -I INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
sudo netfilter-persistent save
