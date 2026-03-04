# Security Checklist — MOLTBOT Portal

## Authentication
- [x] Bearer token required for all data endpoints
- [x] Health endpoint public (no sensitive data exposed)
- [x] Token stored in .env on Mac mini (server-side)
- [x] Token set via localStorage in browser (not in source code)
- [ ] Rotate token every 90 days

## Rate Limiting
- [x] 60 requests/minute per IP (configurable via PORTAL_RATE_LIMIT)
- [x] In-memory tracking (resets on restart)

## Data Sanitization
- [x] Internal file paths stripped from API responses
- [x] Home directory (~) replaced with [HOME]
- [x] MOLTBOT root paths replaced with [MOLTBOT]

## Network Security
- [x] Gateway listens on 127.0.0.1 only (not 0.0.0.0)
- [x] Cloudflare Tunnel encrypts all traffic
- [x] CORS restricted to GitHub Pages domain + localhost dev
- [x] No secrets in frontend code or git repository

## Frontend Security
- [x] API token NOT in source code or environment files
- [x] Token requires manual localStorage setup (user action)
- [x] No direct file/log access from frontend
- [x] All data goes through authenticated API gateway
- [ ] Consider: token input UI with secure storage

## Infrastructure
- [x] Full backup with SHA256 checksums verified
- [x] Rollback documented (ROLLBACK_RUNBOOK.md)
- [x] Git tag `pre-portal` for instant rollback
- [ ] Monitor Cloudflare Tunnel uptime
- [ ] Set up alerts for service degradation
