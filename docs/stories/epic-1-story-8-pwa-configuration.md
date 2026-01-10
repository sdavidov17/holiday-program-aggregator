# Epic 1 - Story 1.8: Progressive Web App (PWA) Configuration

## Status: COMPLETED

**GitHub Issue**: [#243](https://github.com/sdavidov17/holiday-hero/issues/243)
**Implemented**: January 10, 2026
**Commits**: `473f93a`, `2c83bc6`

## Overview

Implement Progressive Web App capabilities to enable Parent Pilot to be installed on mobile devices and work offline, providing a native-like experience for parents searching for holiday programs.

## User Story

**As a** parent using Parent Pilot on my mobile device,
**I want** to install the app on my home screen and use it offline,
**So that** I can quickly access program information without opening a browser.

## Acceptance Criteria

- [x] Web app manifest with Parent Pilot branding
- [x] Service worker with intelligent caching strategies
- [x] App icons in all required sizes (72x72 to 512x512)
- [x] Install prompt for Android/Chrome browsers
- [x] iOS installation instructions displayed for Safari users
- [x] Offline support for previously viewed content
- [x] PWA passes Lighthouse audit for installability

## Technical Implementation

### Files Created

| File | Purpose |
|------|---------|
| `apps/web/public/manifest.json` | Web app manifest with branding |
| `apps/web/public/icons/*.png` | App icons (72, 96, 128, 144, 152, 192, 384, 512) |
| `apps/web/public/icons/icon.svg` | Source SVG for icon generation |
| `apps/web/src/pages/_document.tsx` | PWA meta tags for iOS/Android |
| `apps/web/src/components/InstallPrompt.tsx` | Install banner component |
| `apps/web/src/hooks/usePWAInstall.ts` | Install event handling hook |
| `apps/web/scripts/generate-icons.mjs` | Icon generation script |

### Files Modified

| File | Changes |
|------|---------|
| `apps/web/next.config.mjs` | PWA configuration via next-pwa |
| `apps/web/package.json` | Added sharp, --webpack build flag |
| `apps/web/src/pages/_app.tsx` | Added InstallPrompt component |
| `apps/web/.gitignore` | Added generated SW files |

### Service Worker Caching Strategies

| Resource Type | Strategy | TTL |
|---------------|----------|-----|
| Google Fonts | CacheFirst | 1 year |
| Font files | StaleWhileRevalidate | 1 week |
| Images | StaleWhileRevalidate | 24 hours |
| JS/CSS | StaleWhileRevalidate | 24 hours |
| API calls | NetworkFirst | 24 hours |
| Other pages | NetworkFirst | 24 hours |

### Next.js 16 Compatibility

Added empty `turbopack: {}` config to allow:
- Development mode: Uses Turbopack (PWA disabled)
- Production build: Uses `--webpack` flag for next-pwa

## Testing

- [x] TypeScript type checking passes
- [x] Production build succeeds with service worker generation
- [x] E2E tests pass (dev server starts correctly)
- [x] Integration tests pass
- [x] Security scanning passes
- [x] Deployed to Vercel production

## Dependencies Added

- `next-pwa@5.6.0` - PWA plugin for Next.js
- `sharp@0.34.5` (dev) - Image processing for icon generation

## Future Enhancements

- Add push notification support
- Implement background sync for offline actions
- Add periodic sync for data freshness
- Configure Web Share API for program sharing
