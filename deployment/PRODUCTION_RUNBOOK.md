# ChordCraft Studio - Production Deployment Runbook

## 🚀 **LAST-MILE HARDENING COMPLETE!**

This runbook contains **copy-paste configs** and **surgical patches** for bulletproof production deployment.

---

## 📋 **Pre-Deployment Checklist**

### ✅ **Code Quality**
- [ ] All tests passing (`npm test` / `npm run test:ui`)
- [ ] No linting errors (`npm run lint`)
- [ ] TypeScript compilation clean (`npm run build`)
- [ ] Git working tree clean (`git status`)

### ✅ **Security Hardening**
- [ ] MIME signature detection implemented
- [ ] Rate limiting configured (Nginx + Flask)
- [ ] CORS properly restricted
- [ ] Security headers configured
- [ ] File size limits enforced

### ✅ **Performance Optimizations**
- [ ] ffmpeg.wasm CDN loading
- [ ] Waveform peaks worker implemented
- [ ] Smooth RAF time updates
- [ ] Memory cleanup after decode

---

## 🌐 **1. Cloudflare Configuration**

### DNS Setup
```
studio.yourdomain.com → Vercel (CNAME, Proxied ☁️)
api.yourdomain.com    → YOUR_VPS_IP (A record, Proxied ☁️)
```

### Security Rules
- **WAF**: Security Level High, Bot Fight Mode On
- **Page Rules**: Always Use HTTPS for both subdomains
- **SSL/TLS**: Full (strict) mode
- **Rate Limiting**: 100 req/min per IP

### Environment Variables (Vercel)
```bash
# Production
VITE_BACKEND_URL=https://api.yourdomain.com
VITE_FFMPEG_CORE_URL=https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js

# Preview
VITE_BACKEND_URL=https://api-staging.yourdomain.com
VITE_FFMPEG_CORE_URL=https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js
```

---

## 🖥️ **2. VPS Setup (Ubuntu 20.04+)**

### System Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y nginx certbot python3-pip python3-venv git

# Install Gunicorn
pip3 install gunicorn gevent
```

### Directory Structure
```bash
sudo mkdir -p /srv/chordcraft/{backend,logs}
sudo chown -R www-data:www-data /srv/chordcraft
```

### Clone Repository
```bash
cd /srv/chordcraft
sudo -u www-data git clone https://github.com/budokai-msi/ChordCraft.git .
cd backend
```

### Python Environment
```bash
sudo -u www-data python3 -m venv /srv/chordcraft/venv
sudo -u www-data /srv/chordcraft/venv/bin/pip install -r requirements.txt
```

---

## 🔧 **3. Nginx Configuration**

### Install Configuration
```bash
sudo cp deployment/nginx/api.conf /etc/nginx/conf.d/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL Certificate
```bash
sudo certbot --nginx -d api.yourdomain.com
```

### Verify Configuration
```bash
sudo nginx -t
sudo systemctl status nginx
```

---

## ⚙️ **4. Systemd Service**

### Install Service
```bash
sudo cp deployment/systemd/chordcraft.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable chordcraft
```

### Environment File
```bash
sudo -u www-data tee /srv/chordcraft/backend/.env << EOF
FLASK_ENV=production
PYTHONPATH=/srv/chordcraft/backend
EOF
```

### Start Service
```bash
sudo systemctl start chordcraft
sudo systemctl status chordcraft
```

---

## 🧪 **5. Smoke Tests**

### Run Tests (Linux/Mac)
```bash
chmod +x deployment/scripts/smoke-tests.sh
API_URL=https://api.yourdomain.com FRONTEND_URL=https://studio.yourdomain.com ./deployment/scripts/smoke-tests.sh
```

### Run Tests (Windows)
```powershell
.\deployment\scripts\smoke-tests.ps1 -ApiUrl "https://api.yourdomain.com" -FrontendUrl "https://studio.yourdomain.com"
```

---

## 📊 **6. Monitoring & Maintenance**

### Log Monitoring
```bash
# Application logs
sudo journalctl -u chordcraft -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Service Management
```bash
# Restart after code update
sudo systemctl restart chordcraft

# Reload Nginx after config change
sudo nginx -t && sudo systemctl reload nginx

# Renew SSL certificates
sudo certbot renew --nginx --quiet
```

### Health Checks
```bash
# API health
curl -s https://api.yourdomain.com/health | jq

# Frontend accessibility
curl -I https://studio.yourdomain.com
```

---

## 🔒 **7. Security Hardening**

### Firewall (UFW)
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### File Permissions
```bash
sudo chown -R www-data:www-data /srv/chordcraft
sudo chmod -R 755 /srv/chordcraft
sudo chmod 600 /srv/chordcraft/backend/.env
```

### Regular Updates
```bash
# System updates
sudo apt update && sudo apt upgrade -y

# Python dependencies
sudo -u www-data /srv/chordcraft/venv/bin/pip install --upgrade -r requirements.txt
```

---

## 🚨 **8. Troubleshooting**

### Common Issues

#### 502 Bad Gateway
```bash
# Check service status
sudo systemctl status chordcraft

# Check logs
sudo journalctl -u chordcraft --since "1 hour ago"

# Restart service
sudo systemctl restart chordcraft
```

#### CORS Errors
```bash
# Verify Nginx CORS headers
curl -I https://api.yourdomain.com/health

# Check origin in browser dev tools
```

#### Upload Failures
```bash
# Check file size limits
grep -r "client_max_body_size" /etc/nginx/

# Check Flask limits
grep -r "MAX_CONTENT_LENGTH" /srv/chordcraft/backend/
```

#### SSL Issues
```bash
# Check certificate
openssl s_client -connect api.yourdomain.com:443 -servername api.yourdomain.com

# Renew certificate
sudo certbot renew --nginx --dry-run
```

---

## 📈 **9. Performance Monitoring**

### Key Metrics
- **Response Time**: < 2s for uploads
- **Memory Usage**: < 512MB per worker
- **CPU Usage**: < 80% under load
- **Disk Space**: Monitor `/tmp` cleanup

### Monitoring Tools
```bash
# System resources
htop
iotop
df -h

# Service metrics
sudo systemctl status chordcraft
sudo journalctl -u chordcraft --since "1 hour ago" | grep -i error
```

---

## 🎯 **10. Post-Deploy Verification**

### ✅ **Functional Tests**
- [ ] Upload MP3 → Generate ChordCraft code
- [ ] Playback with waveform visualization
- [ ] Integrity verification working
- [ ] Copy code to clipboard
- [ ] Re-verify button functional

### ✅ **Performance Tests**
- [ ] Large file upload (80MB) works
- [ ] Waveform generation smooth
- [ ] Audio playback responsive
- [ ] Memory usage stable

### ✅ **Security Tests**
- [ ] CORS headers present
- [ ] Rate limiting active
- [ ] SSL certificate valid
- [ ] Security headers configured

### ✅ **Cross-Browser Tests**
- [ ] Chrome/Edge (native FLAC)
- [ ] Firefox (ffmpeg.wasm fallback)
- [ ] Safari/iOS (gesture requirement)
- [ ] Mobile responsive

---

## 🎉 **SUCCESS CRITERIA**

Your ChordCraft Studio is **production-ready** when:

- ✅ **Identical Playback**: Lossless audio embedded and verified
- ✅ **Professional UX**: Smooth waveforms, loading states, error handling
- ✅ **Bulletproof Security**: MIME validation, rate limiting, CORS
- ✅ **High Performance**: CDN loading, worker threads, memory cleanup
- ✅ **Operational Excellence**: Monitoring, logging, health checks

---

## 📞 **Support & Maintenance**

### Daily Operations
- Monitor logs for errors
- Check SSL certificate expiry
- Verify backup procedures

### Weekly Maintenance
- Update dependencies
- Review security logs
- Performance analysis

### Monthly Reviews
- Security audit
- Performance optimization
- Feature planning

---

**🎯 MISSION ACCOMPLISHED!** 

Your ChordCraft Studio is now **boring-in-the-best-way™** production-ready with enterprise-grade security, performance, and reliability! 🚀✨
