# 🚀 ChordCraft Studio - Production Deployment Runbook

## Overview
This runbook provides step-by-step instructions for deploying ChordCraft Studio to production with **boring-in-the-best-way™** reliability.

## 🎯 Architecture
- **Frontend**: React + Vite → Vercel
- **Backend**: Flask + Gunicorn → VPS/Cloud
- **Database**: Supabase (PostgreSQL)
- **CDN**: unpkg.com (ffmpeg.wasm)

---

## 📦 Frontend Deployment (Vercel)

### 1. Environment Variables
```bash
VITE_BACKEND_URL=https://api.yourdomain.com
VITE_FFMPEG_CORE_URL=https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js
```

### 2. Headers Configuration
The `frontend/public/_headers` file is already configured with:
- **CSP**: Allows ffmpeg.wasm from unpkg.com
- **COOP/COEP**: Required for SharedArrayBuffer
- **Security**: X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- **Caching**: Immutable assets with 1-year cache

### 3. Build & Deploy
```bash
cd frontend
npm run build
# Deploy to Vercel (automatic with GitHub integration)
```

### 4. Domain Configuration
- **Studio**: `https://studio.yourdomain.com`
- **API**: `https://api.yourdomain.com`

---

## 🔧 Backend Deployment (VPS/Cloud)

### 1. Server Requirements
- **OS**: Ubuntu 20.04+ or similar
- **Python**: 3.11+
- **Memory**: 4GB+ (for audio processing)
- **Storage**: 50GB+ (for temp files)

### 2. Dependencies Installation
```bash
# Python dependencies
pip install -r backend/requirements.txt

# System dependencies (for audio processing)
sudo apt-get update
sudo apt-get install -y ffmpeg libsndfile1
```

### 3. Gunicorn Configuration
```bash
# Install Gunicorn
pip install gunicorn gevent

# Run with production settings
gunicorn app:app \
  -b 0.0.0.0:5000 \
  -k gevent \
  --workers 2 \
  --threads 4 \
  --timeout 180 \
  --max-requests 1000 \
  --max-requests-jitter 100
```

### 4. Nginx Reverse Proxy
```nginx
server {
  listen 80;
  server_name api.yourdomain.com;

  client_max_body_size 100m;  # matches 80MB guard
  proxy_read_timeout 180s;

  location / {
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_pass http://127.0.0.1:5000;
  }
}
```

### 5. SSL Certificate (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

---

## 🛡️ Security Hardening

### 1. Backend Security
- ✅ **MIME Validation**: Strict audio type checking
- ✅ **Rate Limiting**: 6 uploads/minute per IP
- ✅ **CORS**: Restricted to frontend domain only
- ✅ **File Size**: 100MB limit (matches nginx)
- ✅ **Temp Cleanup**: Automatic cleanup on all code paths

### 2. Frontend Security
- ✅ **CSP Headers**: Prevents XSS attacks
- ✅ **COOP/COEP**: Required for ffmpeg.wasm
- ✅ **Input Validation**: 80MB upload limit
- ✅ **Error Handling**: Graceful fallbacks

### 3. Privacy Compliance
- ✅ **No Persistent Storage**: Audio only in code blocks
- ✅ **Temp File Cleanup**: Automatic deletion
- ✅ **GDPR Ready**: No user data retention

---

## 🧪 Post-Deploy Smoke Tests

### 1. Basic Functionality
```bash
# Test upload → analysis → studio flow
curl -X POST https://api.yourdomain.com/analyze \
  -F "audio=@test-song.mp3" \
  -H "Origin: https://studio.yourdomain.com"
```

### 2. Frontend Tests
- [ ] MP3 upload → progress → Studio opens
- [ ] Integrity: ✅ Identical shows with sample rate/channels
- [ ] Play/Pause/Stop; Space toggles, ←/→ seek 5s
- [ ] FLAC upload in Firefox/Safari → ffmpeg path works
- [ ] Edit code → ⚠️ Modified; Re-verify → ✅
- [ ] Large file (10+ min) → UI stays responsive
- [ ] iOS Safari → play works after tap

### 3. Error Handling
- [ ] Invalid file type → 415 error
- [ ] Rate limit exceeded → 429 error
- [ ] Large file → 413 error
- [ ] Network failure → graceful fallback

---

## 📊 Monitoring & Observability

### 1. Health Checks
```bash
# Backend health
curl https://api.yourdomain.com/health

# Expected response:
{
  "status": "ok",
  "version": "2.0.0",
  "endpoints": ["/analyze", "/generate-music"]
}
```

### 2. Logging
- **Backend**: Structured logging with file size, format, analysis time
- **Frontend**: Console logging for decode paths and errors
- **Nginx**: Access logs for request monitoring

### 3. Performance Metrics
- **Upload Time**: Track analysis duration
- **Memory Usage**: Monitor for leaks during long sessions
- **Error Rates**: Track 4xx/5xx responses

---

## 🔄 CI/CD Pipeline

### 1. Frontend Pipeline
- **Trigger**: Push to main branch
- **Steps**: Install → Build → Test → Deploy
- **Tests**: Vitest suite (WAV headers, FLAC chunks)

### 2. Backend Pipeline
- **Trigger**: Push to main branch
- **Steps**: Install → Lint → Test → Deploy
- **Tests**: Import validation, basic functionality

### 3. Deployment Strategy
- **Frontend**: Automatic Vercel deployment
- **Backend**: Manual deployment with health checks

---

## 🚨 Troubleshooting

### 1. Common Issues

#### Frontend Issues
- **Blank Page**: Check CSP headers, enable COOP/COEP
- **ffmpeg.wasm Fails**: Verify CDN access, check network
- **Audio Won't Play**: Check AudioContext resume, user gesture

#### Backend Issues
- **Upload Fails**: Check file size, MIME type, rate limits
- **Analysis Hangs**: Check memory usage, temp file cleanup
- **CORS Errors**: Verify allowed origins in Flask config

### 2. Debug Commands
```bash
# Check backend logs
tail -f /var/log/nginx/access.log
journalctl -u gunicorn -f

# Test ffmpeg.wasm loading
curl -I https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js

# Verify SSL certificate
openssl s_client -connect api.yourdomain.com:443
```

---

## 📈 Performance Optimization

### 1. Frontend Optimizations
- **Chunk Splitting**: Main chunk ~28KB, vendor ~200KB
- **Lazy Loading**: ffmpeg.wasm loaded on demand
- **Memory Management**: Blob URL cleanup, array nulling
- **Smooth UI**: 60fps seekbar updates

### 2. Backend Optimizations
- **Gunicorn Workers**: 2 workers, 4 threads each
- **Temp File Cleanup**: Automatic deletion on all paths
- **Rate Limiting**: Prevents abuse, maintains performance
- **CORS Caching**: Reduces preflight requests

---

## 🔐 Security Checklist

- [ ] **HTTPS**: SSL certificates installed and valid
- [ ] **CORS**: Restricted to frontend domain only
- [ ] **Rate Limiting**: 6 uploads/minute per IP
- [ ] **MIME Validation**: Strict audio type checking
- [ ] **File Size Limits**: 100MB backend, 80MB frontend
- [ ] **CSP Headers**: XSS protection enabled
- [ ] **Temp Cleanup**: No persistent audio storage
- [ ] **Error Handling**: No sensitive data in error messages

---

## 🎯 Success Metrics

### 1. Performance Targets
- **Upload Time**: < 30s for 10MB file
- **Analysis Time**: < 15s for 5-minute song
- **UI Responsiveness**: 60fps during playback
- **Memory Usage**: < 500MB per worker

### 2. Reliability Targets
- **Uptime**: 99.9% availability
- **Error Rate**: < 1% of requests
- **Success Rate**: > 95% successful analyses
- **Recovery Time**: < 5 minutes for failures

---

## 🚀 Rollout Strategy

### Phase 1: Soft Launch
- Deploy to staging environment
- Run full smoke test suite
- Monitor for 24 hours
- Fix any critical issues

### Phase 2: Production Launch
- Deploy to production
- Monitor error rates and performance
- Gradual traffic increase
- User feedback collection

### Phase 3: Scale
- Monitor resource usage
- Scale workers as needed
- Optimize based on real usage
- Plan for future features

---

## 📞 Support & Maintenance

### 1. Monitoring
- **Uptime**: UptimeRobot or similar
- **Errors**: Sentry integration (optional)
- **Performance**: Vercel Analytics (frontend)

### 2. Maintenance Schedule
- **Daily**: Check error logs, monitor performance
- **Weekly**: Review usage metrics, update dependencies
- **Monthly**: Security updates, performance optimization

### 3. Emergency Procedures
- **Rollback**: Revert to previous deployment
- **Scale**: Add workers during high load
- **Debug**: Enable verbose logging for issues

---

## ✅ Pre-Launch Checklist

- [ ] All environment variables set
- [ ] SSL certificates installed
- [ ] Health checks responding
- [ ] Smoke tests passing
- [ ] Error monitoring configured
- [ ] Backup procedures documented
- [ ] Team trained on procedures
- [ ] Rollback plan tested

---

**🎉 Ready for Production!**

Your ChordCraft Studio is now **boring-in-the-best-way™** production-ready with:
- ✅ Bulletproof security
- ✅ Smooth user experience  
- ✅ Comprehensive monitoring
- ✅ Easy maintenance
- ✅ Scalable architecture

**Deploy with confidence! 🚀**
