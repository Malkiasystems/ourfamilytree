# Koo Heritage Platform

**A clan-based family tree and digital heritage platform for preserving family history across generations.**

Koo (Swahili for "clan" or "lineage") is built to be a living archive that families can use for the next 50 to 100 years. It combines an interactive family tree, Wikipedia-style person profiles, a digital media archive, and a community storytelling layer into one platform.

---

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | React 18 + Vite | Fast, component-based, massive ecosystem |
| Styling | Vanilla CSS with CSS Variables | No framework lock-in, full control, lightweight |
| Backend | Supabase (PostgreSQL + Auth + Storage + Realtime) | Open-source, self-hostable, built-in auth and RLS |
| Hosting | Vercel or Netlify | Free tier, global CDN, automatic deploys |
| Database | PostgreSQL via Supabase | Relational integrity for family data, full-text search |
| Storage | Supabase Storage | Photos, videos, audio recordings |
| Auth | Supabase Auth | Email, phone, social login |
| Future | PWA + Service Workers | Offline support for low-bandwidth areas |

---

## Architecture Overview

```
    [User's Browser]
           |
     [React SPA on Vercel/Netlify]
           |
     [Supabase Client SDK]
           |
    ---------------------------------
    |              |                |
  [Auth]     [PostgreSQL]     [Storage]
    |              |                |
  [RLS]    [Row Level Security]  [CDN]
    |              |                |
  [JWT]    [Functions/RPCs]   [Media Files]
```

### Key Architecture Decisions

1. **Relational database for family data**: Family trees are inherently relational. Parent-child, spouse, sibling relationships need referential integrity. PostgreSQL handles this natively.

2. **Row Level Security**: Different users have different permissions. RLS at the database level means security is enforced regardless of how the data is accessed.

3. **Edit proposal system**: All changes by contributors go through a moderation queue. This prevents vandalism while encouraging community participation.

4. **Separate media storage**: Photos, videos, and audio are stored in object storage (Supabase Storage) with metadata in PostgreSQL. This keeps the database lean and media delivery fast via CDN.

---

## Project Structure

```
koo-heritage/
  index.html              # Entry point
  vite.config.js           # Build configuration
  package.json             # Dependencies
  public/
    favicon.svg            # App icon
  src/
    main.jsx               # React mount point
    index.jsx              # Main application (all components)
  docs/
    schema.sql             # Full database schema with RLS
    API.md                 # API endpoint reference
    ARCHITECTURE.md        # This file (architecture notes)
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project (free tier works)

### Installation

```bash
git clone https://github.com/your-username/koo-heritage.git
cd koo-heritage
npm install
```

### Database Setup (required before first run)

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. In your Supabase project, go to the SQL Editor
3. Copy the contents of `docs/schema.sql` and run it to create all tables
4. Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Find these values in your Supabase dashboard under Settings > API.

### Run locally

```bash
npm run dev
```

The app opens at `http://localhost:3000`. If Supabase is not yet configured, you'll see empty states prompting you to add your first family member.

### Deploy

```bash
npm run build
# Deploy the `dist` folder to Vercel, Netlify, or any static host
```

---

## Core Features

### 1. Interactive Family Tree
- Visual, zoomable tree organized by generation
- Click any person to see their full profile
- Color-coded by gender with deceased indicator

### 2. Person Profiles (Wikipedia-style)
- Full biography with name meaning
- Achievements and life milestones
- Family relationships with navigation
- Personal timeline of life events
- Stories and memories from family members

### 3. Relationship System
- Parent-child, spouse, sibling relationships
- Extended: guardian (mlezi), godparent
- Polygamy support (multiple concurrent spouses)
- Referential integrity enforced at database level

### 4. Stories & Memories
- Family members can share memories about any person
- Story types: memory, history, tribute, tradition, legacy message
- Moderation system for published content

### 5. Timeline View
- Chronological events across all generations
- Filter by event type (birth, death, marriage, milestone)
- Click through to person profiles

### 6. Search
- Fuzzy search by name, place, occupation
- Trigram-based PostgreSQL search for partial matches

### 7. Community Contribution
- Add new people, stories, and media
- All contributions go through moderation queue
- Role-based access: Admin, Editor, Contributor, Viewer

### 8. Clan System
- Top-level grouping by clan/ukoo
- Clan totems, origins, mottos, and migration stories
- Clan-specific proverbs and wisdom

---

## Cultural Design Decisions

### Name Meaning System
Many African names carry deep meaning tied to birth circumstances, family events, or spiritual significance. Every person record includes a `name_meaning` field displayed prominently on their profile.

### Elder Voice Preservation
The media system supports audio recordings specifically for capturing elder voices. Many family historians are elders who won't type but will speak. Audio is a first-class citizen alongside photos and video.

### Swahili/English Support
The platform is designed for bilingual use. Content can exist in both Swahili and English. The database schema includes both `text_sw` and `text_en` fields for proverbs and wisdom.

### Proverbs & Wisdom Bank
A dedicated proverbs table stores family and clan sayings with translations, attribution, and usage context. A rotating proverb is displayed on the homepage.

### Legacy Messages
Stories can be tagged with a `target_generation` number, allowing family members to write messages intended for future generations. This is the "digital time capsule" feature.

---

## Roles & Permissions

| Role | View | Add | Edit | Approve | Admin |
|------|------|-----|------|---------|-------|
| Viewer | Yes | No | No | No | No |
| Contributor | Yes | Submit for review | Submit for review | No | No |
| Editor | Yes | Yes | Yes | Yes | No |
| Admin | Yes | Yes | Yes | Yes | Yes |

---

## Future Roadmap

### Phase 2: Enhanced Features
- Photo tagging (tag people in group photos)
- Family event calendar with reminders
- "On This Day" daily digest
- Living tribute pages (write tributes while someone is alive)
- DNA/ancestry integration hooks
- Family recipe collection

### Phase 3: Offline & Low-Bandwidth
- PWA with service worker caching
- Offline-first data sync
- Compressed image variants for 2G/3G
- SMS/USSD gateway for basic access

### Phase 4: Export & Preservation
- Static HTML export (works without servers forever)
- PDF family book generation
- QR memorial codes for physical objects
- GEDCOM import/export (genealogy standard)
- Automated Supabase backups to external storage

### Phase 5: Platform Features
- Multi-family support (each family gets their own tree)
- Inter-family connections (marriages between families)
- Public/private visibility controls
- WhatsApp integration for sharing and invitations
- AI-assisted translation (Swahili/English/other languages)

---

## Design Philosophy

### Colors
- **Earth tones**: Deep brown (#2C1810), bark (#3D2914), clay (#6B4C35)
- **Parchment backgrounds**: Cream (#FAF7F2), warm white (#FEFDFB)
- **Gold accents**: #C8A96E (used sparingly for emphasis)
- **Gender coding**: Muted blue (#4A6B8A) for male, muted rose (#8A5A6B) for female

### Typography
- **Display**: Cormorant Garamond (elegant, timeless serif)
- **Body**: Source Sans 3 (clean, readable sans-serif)

### Icons
- Custom SVG icon set (no external dependencies)
- 1.5px stroke weight for refined, premium feel
- Consistent 24x24 viewBox

### Aesthetic
- Editorial / archival feel
- Restrained, serious design appropriate for heritage content
- No emojis, no playful UI, no AI-generated aesthetics
- Warm earth tones that feel like opening an old family album

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

All contributions go through code review before merging.

---

## License

MIT License. This platform is designed to be freely available for families worldwide to preserve their heritage.

---

*"Mti hukua kwa mizizi yake" - A tree grows by its roots.*
