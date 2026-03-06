#!/bin/bash
set -e

# ============================================================
# System updates
# ============================================================
sudo apt update && sudo apt upgrade -y

# ============================================================
# Node.js, pnpm, pm2
# ============================================================
sudo apt install -y curl ca-certificates
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm -g i pm2
sudo npm -g i pnpm

# ============================================================
# pdfLaTeX + dependencies (for resume PDF generation)
# ============================================================
sudo apt install -y \
  texlive-latex-base \
  texlive-latex-recommended \
  texlive-latex-extra \
  texlive-fonts-recommended \
  texlive-fonts-extra \
  texlive-xetex \
  latexmk

# ============================================================
# Nginx + Certbot
# ============================================================
sudo apt install -y nginx certbot python3-certbot-nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Copy nginx config and enable site
sudo cp nginx/api.conf /etc/nginx/sites-available/api.betaversion.io
sudo ln -sf /etc/nginx/sites-available/api.betaversion.io /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# SSL certificate
sudo certbot --nginx -d api.betaversion.io

# ============================================================
# Firewall rules
# ============================================================
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -I INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
sudo netfilter-persistent save
