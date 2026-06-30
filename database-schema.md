# Database Schema u2014 Lombok Tech Hub

## Visual Table Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                    auth.users (built-in)                     │
│  (Supabase handles signup / login / passwords)               │
└──────────┬──────────────────────────────────────────────────┘
           │ 1:1
           ▼
┌──────────────────────┐        ┌──────────────────────┐
│      profiles        │        │     join_requests     │
│──────────────────────│        │──────────────────────│
│ id (PK)              │        │ id (PK)              │
│ full_name            │        │ full_name            │
│ avatar_url           │        │ email                │
│ bio / interest       │        │ interest / level     │
│ level                │        │ message              │
│ github / linkedin    │        │ status               │
│ whatsapp             │        │ created_at           │
│ is_admin             │        └──────────────────────┘
│ created_at           │        (pre-signup form entries)
└────────┬─────────────┘
         │ 1:N                   ┌──────────────────────┐
         ├──────────────────────►│        posts          │
         │                       │──────────────────────│
         │                       │ id (PK)              │
         │                       │ title / slug         │
         │                       │ content / excerpt    │
         │                       │ author_id (FK)       │
         │                       │ published / published_at│
         │                       └──────────────────────┘
         │ 1:N
         ├──────────────────────►┌──────────────────────┐
         │                       │       events          │
         │                       │──────────────────────│
         │                       │ id (PK)              │
         │                       │ title / description  │
         │                       │ event_type           │
         │                       │ location             │
         │                       │ start_at / end_at    │
         │                       │ max_attendees        │
         │                       │ created_by (FK)      │
         │                       │ published            │
         │                       └──────────┬───────────┘
         │                                  │ 1:N
         │                       ┌──────────▼───────────┐
         │                       │        rsvps          │
         │                       │──────────────────────│
         └──────────────────────►│ event_id (FK)        │
                                 │ profile_id (FK)      │
                                 │ status (going/maybe) │
                                 │ UNIQUE(event, person)│
                                 └──────────────────────┘
```

## Quick Reference

| Table | Purpose | Who can read | Who can write |
|-------|---------|-------------|---------------|
| **profiles** | Extended user info | Public (if `is_public = true`) | The user themselves + admins |
| **events** | Meetups & workshops | Everyone (only published) | Admins / organizers |
| **rsvps** | Attendance tracking | Authenticated users | Authenticated users |
| **activities** | Homepage cards | Everyone | Admins |
| **posts** | Blog / announcements | Everyone (only published) | Admins + authors |
| **join_requests** | Form submissions from non-members | Admins only | Anyone (no login needed) |
| **gallery** | Event photos | Everyone | Authenticated users |

## Data Flow Examples

**Visitor browses site:**
```
index.html → fetch published events (SELECT * FROM events WHERE published = true ORDER BY start_at)
           → fetch first 3 activities (SELECT * FROM activities WHERE published = true ORDER BY sort_order)
           → fetch latest post excerpt (SELECT title, excerpt, slug FROM posts WHERE published = true LIMIT 1)
```

**User joins:**
```
Fill form → INSERT INTO join_requests (full_name, email, interest, level, message)
         → Admin gets notified → Admin creates Supabase Auth user → INSERT INTO profiles
```

**Member RSVPs to event:**
```
Click "RSVP" → INSERT INTO rsvps (event_id, profile_id, status = 'going')
             → Button changes to "Going ✓"
             → Event page shows count (SELECT COUNT(*) FROM rsvps WHERE event_id = X AND status = 'going')
```
