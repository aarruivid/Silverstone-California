# MOLTBOT Portal — Deployment Guide

## Architecture
- **Frontend:** React SPA on GitHub Pages (`/docs/portal/`)
- **Backend:** Flask API Gateway on Mac mini (port 5080)
- **Tunnel:** Cloudflare Tunnel (Mac mini → internet)

## Deploy Frontend

### Build
```bash
cd ~/Documents/Silverstone-California/portal
npm run build
```

### Push to GitHub Pages
```bash
cd ~/Documents/Silverstone-California
git add docs/portal/
git commit -m "deploy: update portal build"
git push origin main
```
Wait 2-3 minutes for GitHub Pages to rebuild.

## Start Backend (Mac mini)

```bash
cd ~/Documents/MOLTBOT

# 1. Start individual dashboard services (if not already running)
/opt/homebrew/bin/python3.11 skills/mission_control/api.py &    # port 5055
/opt/homebrew/bin/python3.11 skills/income_dashboard/web/api.py &  # port 5050
bash run_isarv_dashboard.sh &                                      # port 5065
bash run_fitness_dashboard.sh &                                    # port 5070

# 2. Start the portal API gateway
/opt/homebrew/bin/python3.11 skills/portal_api/gateway.py &       # port 5080

# 3. (Optional) Start Cloudflare Tunnel for remote access
cloudflared tunnel --url http://127.0.0.1:5080
```

## Configure Token in Browser

1. Open the portal in your browser
2. Open DevTools Console (Cmd+Option+J)
3. Run: `localStorage.setItem('portal_token', 'YOUR_TOKEN_HERE')`
   (Replace with the PORTAL_API_TOKEN from ~/Documents/MOLTBOT/.env)
4. Refresh the page

## URLs
- **Local dev:** http://localhost:5173/Silverstone-California/portal/
- **GitHub Pages:** https://aarruivid.github.io/Silverstone-California/portal/
- **Solar Tools (unchanged):** https://aarruivid.github.io/Silverstone-California/

## Verify Deployment
1. Open https://aarruivid.github.io/Silverstone-California/ → Solar tools work
2. Open https://aarruivid.github.io/Silverstone-California/portal/ → Portal loads
3. Check browser console for API errors
4. Test each dashboard tab loads (will show loading state if backend not connected)
