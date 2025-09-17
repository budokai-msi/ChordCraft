# Cloudflare Production Configuration

## DNS Setup

### A Records (Proxied = ☁️ Orange)
```
studio.yourdomain.com → Vercel (CNAME to your Vercel domain)
api.yourdomain.com    → YOUR_VPS_IP (A record)
```

## Security Rules

### WAF Configuration
- **Security Level**: High
- **Bot Fight Mode**: On
- **Challenge Passage**: 30 minutes
- **Browser Integrity Check**: On

### Page Rules
1. **Always Use HTTPS** for both subdomains
2. **Cache Level**: Bypass cache for `api.yourdomain.com/*`
3. **Security Level**: High for `api.yourdomain.com/*`

## SSL/TLS Settings

### Encryption Mode
- **SSL/TLS encryption mode**: Full (strict)
- **Edge Certificates**: Universal SSL enabled
- **Always Use HTTPS**: On
- **HTTP Strict Transport Security (HSTS)**: On

### Origin Server
- **Authenticated Origin Pulls**: On (recommended)
- **Minimum TLS Version**: 1.2

## Performance

### Caching
- **Browser Cache TTL**: 4 hours
- **Crawl Hints**: On
- **Mirage**: On (for images)
- **Polish**: Lossless

### Speed
- **Auto Minify**: CSS, JavaScript, HTML
- **Brotli**: On
- **HTTP/2**: On
- **HTTP/3 (with QUIC)**: On

## Security Headers

### Transform Rules (Optional)
```
If URI Path starts with "/api/"
Then Set Security Headers:
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - Referrer-Policy: same-origin
```

## Rate Limiting

### Custom Rules
```
Rule: "API Rate Limit"
Expression: (http.host eq "api.yourdomain.com")
Action: Block
Rate: 100 requests per minute per IP
```

## Upload Size Limits

Cloudflare default: ~100MB per request
- Matches our backend 100MB limit
- Matches our frontend 80MB guard
- No additional configuration needed

## Monitoring

### Analytics
- **Web Analytics**: On
- **Bot Analytics**: On
- **Security Events**: On

### Alerts
- **Security Events**: Email alerts for high-severity events
- **Uptime Monitoring**: Set up external monitoring for both subdomains

## Environment Variables (Vercel)

### Production
```
VITE_BACKEND_URL=https://api.yourdomain.com
VITE_FFMPEG_CORE_URL=https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js
```

### Preview
```
VITE_BACKEND_URL=https://api-staging.yourdomain.com
VITE_FFMPEG_CORE_URL=https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js
```

## Post-Deploy Verification

1. **SSL Check**: https://www.ssllabs.com/ssltest/
2. **Security Headers**: https://securityheaders.com/
3. **Performance**: https://pagespeed.web.dev/
4. **Uptime**: Set up external monitoring

## Troubleshooting

### Common Issues
- **502 Bad Gateway**: Check origin server and SSL certificates
- **CORS Errors**: Verify origin headers in Nginx config
- **Upload Failures**: Check file size limits and timeouts
- **Slow Loading**: Verify Cloudflare caching rules

### Debug Commands
```bash
# Check DNS propagation
dig studio.yourdomain.com
dig api.yourdomain.com

# Test SSL
openssl s_client -connect api.yourdomain.com:443 -servername api.yourdomain.com

# Check headers
curl -I https://api.yourdomain.com/health
```
