# Vercel Deployment Configuration

## 🚀 **Quick Fix: Vercel Project Settings**

### **1. Project Root Configuration**
Go to **Vercel Dashboard → Your Project → Settings → Build & Output**

```
Root Directory: frontend
Framework Preset: Vite
Install Command: npm ci
Build Command: npm run build
Output Directory: dist
```

✅ **Enable**: "Skip deployments when there are no changes to the root directory"

### **2. Remove Production Overrides**
1. Open the current Production deployment in Vercel
2. Click **"Use Project Settings"** or **"Redeploy with Project Settings"**
3. This clears any override commands

### **3. Environment Variables**
Go to **Project → Settings → Environment Variables**

#### **Production:**
```
VITE_BACKEND_URL = https://api.yourdomain.com
VITE_FFMPEG_CORE_URL = https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js
VITE_SUPABASE_URL = https://wgofqkisiqkygpnliuwl.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indnb2Zxa2lzaXFreWdwbmxpdXdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4ODE4MzEsImV4cCI6MjA3MzQ1NzgzMX0.DcqJ7XNAkMiOT-3Vnlmvua84wNqahgfd3JQ9wpTW-yg
```

#### **Preview:**
```
VITE_BACKEND_URL = https://api-staging.yourdomain.com
VITE_FFMPEG_CORE_URL = https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js
VITE_SUPABASE_URL = https://wgofqkisiqkygpnliuwl.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indnb2Zxa2lzaXFreWdwbmxpdXdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4ODE4MzEsImV4cCI6MjA3MzQ1NzgzMX0.DcqJ7XNAkMiOT-3Vnlmvua84wNqahgfd3JQ9wpTW-yg
```

### **4. Verify Configuration**
After making these changes:

1. **Check Build Logs**: Should show `npm ci` and `npm run build` from frontend/
2. **Check Network Tab**: Look for `/assets/index-*.css` loading (design tokens)
3. **Test Upload Flow**: Upload → Studio → Transport → Waveform

### **5. Optional: Ignored Build Step**
If you ever need to skip builds for backend-only changes:

```bash
# Add to Project Settings → Build & Output → Ignored Build Step
CHANGED="$(git diff --name-only "$VERCEL_GIT_PREVIOUS_SHA" "$VERCEL_GIT_COMMIT_SHA")"
echo "$CHANGED" | grep -E '^(frontend/|package\.json|package-lock\.json)$' >/dev/null && exit 1 || exit 0
```

## 🎯 **Expected Results**

After these changes:
- ✅ **Consistent Builds**: Every deploy uses the same Vite configuration
- ✅ **Proper Headers**: Security and caching headers applied correctly
- ✅ **Design Tokens**: CSS variables load from `/assets/`
- ✅ **Environment Variables**: Backend URL and CDN URLs configured
- ✅ **Figma Prototype**: Available at `/prototype/` for design reference

## 🔧 **Troubleshooting**

### **Build Fails**
- Check that `frontend/package.json` exists
- Verify `npm ci` works locally in frontend/
- Check Vercel build logs for specific errors

### **Headers Not Applied**
- Verify `frontend/vercel.json` is committed
- Check that headers are in the correct format
- Redeploy after making changes

### **Environment Variables Not Working**
- Check variable names start with `VITE_`
- Verify they're applied to the correct environment
- Redeploy after adding variables

## 📱 **Testing Checklist**

- [ ] Upload page loads with proper styling
- [ ] File upload works and shows progress
- [ ] Studio page loads with transport controls
- [ ] Waveform visualization appears
- [ ] Audio playback works
- [ ] Copy code to clipboard works
- [ ] Integrity verification works
- [ ] Figma prototype accessible at `/prototype/`
