# RoadShield AI — Hackathon Winning Build

A single map-centered command center for road safety in India, unifying all three problem statements (RoadSOS, DriveLegal, RoadWatch) into one AI co-pilot. Built on TanStack Start + Lovable AI Gateway (Gemini) + Google Maps Platform connector.

## Core experience

A full-screen interactive India map is the home page. A floating AI chat dock sits over it. Everything the user asks resolves to map actions + structured answers.

```text
┌──────────────────────────────────────────────┐
│  RoadShield AI            [SOS]  [Lang ▾]    │
│ ┌────────────┐                               │
│ │ Chat dock  │        INTERACTIVE MAP        │
│ │ "nearest   │     (markers, routes,         │
│ │  trauma    │      road overlays)           │
│ │  centre"   │                               │
│ │            │   [Mode: SOS | Legal | Watch] │
│ └────────────┘                               │
└──────────────────────────────────────────────┘
```

## Modules (all on the same map)

### 1. RoadSOS — Golden Hour Mode (headline feature)
- Big red SOS button → auto-detect geolocation
- Map shows nearest hospitals, trauma centers, police stations, ambulances, fuel, mechanics (Google Places New API via gateway)
- One-tap `tel:112` / `tel:108`, plus prefilled SMS with live location (works without internet via `sms:` deep link)
- "Fastest route to hospital" using Routes API
- PWA + IndexedDB cache of last-known nearby contacts for offline fallback

### 2. DriveLegal — Challan Calculator + Law Chat
- Chat: "fine for no helmet in Tamil Nadu?" → AI answers using a curated MV Act + state-amendment knowledge base (RAG via embeddings)
- Structured Challan Calculator form: violation type + vehicle type + state → estimated fine + legal section + prevention tip
- Multilingual responses (English, Hindi, Tamil) via Gemini

### 3. RoadWatch — Transparency + Complaint Router
- Click any road on the map → "Road Transparency Card" (type NH/SH/MDR via OSM tags, mock contractor/budget/last-repaired seeded from PMGSY-style sample data)
- "Report issue" → AI Complaint Router: drafts a formal complaint email to the correct authority (NHAI / State PWD / Municipal) based on road type + location, opens `mailto:` with prefilled body, logs to DB

## Tech architecture

```text
Browser (React + Maps JS API + PWA)
   │
   ├── /api/chat  (streaming, AI SDK + Gemini)
   │     └─ tools: searchPlaces, getRoute, lookupLaw,
   │              calcChallan, routeComplaint
   │
   ├── server fns: nearbyEmergency, computeRoute,
   │               lookupLaw, calcChallan, draftComplaint
   │
   └── Google Maps gateway: Places New, Routes, Geocoding
```

- **Frontend**: TanStack Start, Google Maps JS (browser key from connector), Leaflet-style overlays via Maps JS, Tailwind, shadcn, AI Elements for chat
- **AI**: Lovable AI Gateway → `google/gemini-3-flash-preview`, AI SDK tool calling, structured output for Challan Calculator
- **Data**:
  - Google Places (New) for hospitals/police/towing
  - Routes API for hospital routing
  - Seeded JSON for MV Act sections + state fine schedules (India), embedded for RAG-style lookup
  - Seeded mock contractor/budget table for RoadWatch demo (clearly labeled "sample data")
- **Offline**: PWA with service worker (manifest + cached emergency contacts in IndexedDB)
- **Backend**: Lovable Cloud (Supabase) for complaint log + user-submitted road reports

## Pages / routes

- `/` — Map command center (home)
- `/legal` — DriveLegal dedicated view (calculator UI + chat)
- `/watch/road/$roadId` — Road Transparency Card detail
- `/sos` — Full-screen emergency mode
- `/about` — Hackathon pitch page (mirrors 7-slide deck)
- `/api/chat` — streaming AI route

## Design direction

Dark "command center" aesthetic — deep navy `#0B1220` base, electric cyan `#22D3EE` accents, emergency red `#EF4444` for SOS. Mono+sans pairing (JetBrains Mono for data, Inter for UI). Map uses a custom dark style. Subtle glow on active markers, smooth route-draw animation, pulsing SOS button.

## Build order

1. Enable Lovable Cloud, provision LOVABLE_API_KEY, connect Google Maps Platform
2. Bootstrap map home page + dark map style + geolocation
3. Streaming AI chat dock with tool calling (Places + Routes tools first)
4. RoadSOS flow: SOS button → nearby emergency markers → routing → tel/sms actions
5. DriveLegal: seed India law JSON, build Challan Calculator with structured output, chat lookup tool
6. RoadWatch: OSM road-click → Transparency Card (seeded mock), complaint router via mailto + DB log
7. PWA manifest + offline cache of last emergency results
8. Multilingual toggle (English/Hindi/Tamil) in system prompt
9. About/pitch page mirroring the 7-slide submission
10. Polish: animations, empty states, mobile layout, SEO meta per route

## Out of scope (call out to judges as roadmap)

- Live government contractor APIs (mocked with realistic sample data)
- Voice input (can add if time permits)
- Native app wrapper

## Risks / notes

- Google Maps connector must be linked; managed key works on `*.lovable.app` for demo
- Law data is curated sample (MV Act 2019 + a few state amendments) — accuracy disclaimer shown in UI
- True offline AI is not possible; offline mode serves cached emergency data + static law lookup only

Approve and I'll start building.