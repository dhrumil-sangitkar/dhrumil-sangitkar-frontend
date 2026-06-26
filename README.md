# Dhrumil Shah | Jain Sangitkar — React Portfolio

A fully responsive React + TypeScript + Tailwind CSS portfolio for Dhrumil Shah, Jain Sangitkar.

---

## Tech Stack

- **React 18** + **TypeScript**
- **Tailwind CSS v3** (custom gold + royal color tokens)
- **Vite** (fast build + HMR)
- **Axios** (API client with interceptors)
- **React Context API** (global media state)
- **FontAwesome 6** + **Google Fonts (Cinzel, Inter)**

---

## Project Structure

```
src/
├── components/
│   ├── Navbar.tsx             — Sticky responsive nav with hamburger
│   ├── HeroSection.tsx        — Hero with audio player
│   ├── DigitalCard.tsx        — Visiting card (front + back)
│   ├── ServicesSection.tsx    — 10 religious service cards
│   ├── GallerySection.tsx     — Media gallery with filters
│   ├── MediaViewerModal.tsx   — Full-screen image/video viewer
│   ├── AdminPinModal.tsx      — PIN-protected admin access
│   ├── AdminDashboardModal.tsx — Full CRUD media manager
│   ├── ContactSection.tsx     — Inquiry form → WhatsApp
│   ├── Footer.tsx
│   ├── ToastContainer.tsx     — Animated notification toasts
│   └── SangitkarChatbot.tsx   — AI chatbot (Anthropic Claude)
├── context/
│   └── MediaContext.tsx       — Global state + backend/fallback logic
├── services/
│   └── api.ts                 — Axios API client (mediaApi, bookingApi, authApi)
├── types/
│   └── index.ts               — TypeScript interfaces
├── App.tsx
├── main.tsx
└── index.css
```

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and configure your backend URL
cp .env.example .env

# 3. Start dev server
npm run dev
```

---

## Backend Integration

The frontend calls these REST API endpoints via `src/services/api.ts`:

| Method | Endpoint           | Description                          |
|--------|--------------------|--------------------------------------|
| GET    | `/api/media`       | Fetch all gallery media items        |
| POST   | `/api/media`       | Create a new media item (admin only) |
| PUT    | `/api/media/:id`   | Update a media item (admin only)     |
| DELETE | `/api/media/:id`   | Delete a media item (admin only)     |
| POST   | `/api/booking`     | Submit a booking inquiry             |
| POST   | `/api/auth/verify-pin` | Verify admin PIN → returns JWT  |

### Offline Fallback
If the backend is unreachable, the app automatically:
- Uses **localStorage** for media CRUD
- Uses **hardcoded PIN** (`1008`) for admin access
- Opens **WhatsApp** directly for booking submissions

### Expected Media Item Shape
```json
{
  "id": "media-1234",
  "title": "Live Bhakti Sandhya",
  "gujaratiTitle": "ભક્તિ સંધ્યા",
  "type": "youtube",
  "url": "https://www.youtube-nocookie.com/embed/...",
  "description": "Beautiful live devotional performance.",
  "category": "Video",
  "timestamp": 1719000000000
}
```

---

## Deployment

### Vercel (Recommended — free)
```bash
npm install -g vercel
vercel
# Set VITE_API_BASE_URL in Vercel dashboard → Project Settings → Environment Variables
```

### Netlify
```bash
npm run build
# Drag & drop the 'dist' folder on netlify.com/drop
# Or use: netlify deploy --prod --dir=dist
```

### Custom VPS / cPanel
```bash
npm run build
# Upload 'dist/' contents to public_html/
# Add _redirects file: /* /index.html 200
```

### Build command
```bash
npm run build
# Output: dist/
```

---

## Admin Access

- Click the ⚙️ gear icon in the gallery section header
- Enter PIN: **1008** (default)
- Change the PIN via your backend's `/api/auth/update-pin` endpoint (implement as needed)

---

## AI Chatbot

The Sangitkar AI chatbot uses **Claude claude-sonnet-4-6** (Anthropic API). 
The API key is managed by Claude.ai's built-in proxy — no key needed when running inside Claude artifacts.

For standalone deployment, add your own Anthropic API key in a backend proxy to avoid exposing it in frontend code.

---

## Customization Checklist

- [ ] Update phone number (`7383950244`) in `ContactSection.tsx`, `Navbar.tsx`
- [ ] Update WhatsApp link in `ContactSection.tsx`
- [ ] Set real Instagram, YouTube, Facebook URLs
- [ ] Replace placeholder audio URL in `HeroSection.tsx`
- [ ] Set `VITE_API_BASE_URL` in `.env` to your backend
- [ ] Deploy and update admin PIN via backend

---

© 2026 Dhrumil Shah Portfolio
