# Koo Heritage Platform - API Reference

## Base URL
```
https://your-project.supabase.co/rest/v1
```

## Authentication
All requests require Supabase JWT token:
```
Authorization: Bearer <token>
apikey: <anon-key>
```

---

## People

### List People
```
GET /people?verified=eq.true&order=generation.asc
```

### Get Person by ID
```
GET /people?id=eq.{id}&select=*,clans(name,totem,origin)
```

### Search People
```
POST /rpc/search_people
Body: { "query": "Hassan", "max_results": 20 }
```

### Get Person's Relatives
```
POST /rpc/get_relatives
Body: { "target_person_id": "uuid-here" }
```

### Create Person (via edit proposal)
```
POST /edit_proposals
Body: {
  "target_table": "people",
  "action": "create",
  "proposed_data": {
    "first_name": "Juma",
    "last_name": "Mwinyi",
    "gender": "male",
    "clan_id": "uuid",
    "birth_year": 1955,
    "bio": "..."
  }
}
```

### Update Person (via edit proposal)
```
POST /edit_proposals
Body: {
  "target_table": "people",
  "target_id": "person-uuid",
  "action": "update",
  "proposed_data": {
    "bio": "Updated biography..."
  }
}
```

---

## Relationships

### Get All Relationships for a Person
```
GET /relationships?or=(person_a_id.eq.{id},person_b_id.eq.{id})
```

### Add Relationship (via edit proposal)
```
POST /edit_proposals
Body: {
  "target_table": "relationships",
  "action": "create",
  "proposed_data": {
    "person_a_id": "parent-uuid",
    "person_b_id": "child-uuid",
    "relationship_type": "parent_child"
  }
}
```

---

## Clans

### List All Clans
```
GET /clans?order=name.asc
```

### Get Clan with Members
```
GET /clans?id=eq.{id}&select=*,people(id,first_name,last_name,generation)
```

---

## Stories

### List Published Stories
```
GET /stories?is_published=eq.true&order=created_at.desc
```

### Get Stories for a Person
```
GET /stories?person_id=eq.{id}&is_published=eq.true
```

### Submit Story
```
POST /stories
Body: {
  "person_id": "uuid",
  "author_name": "Rashid Mwinyi",
  "title": "The Day...",
  "content": "Full story text...",
  "story_type": "memory"
}
```

---

## Life Events / Timeline

### Get All Events (chronological)
```
GET /life_events?order=event_year.asc&select=*,people(first_name,last_name)
```

### Get Events for a Person
```
GET /life_events?person_id=eq.{id}&order=event_year.asc
```

### Filter Events by Type
```
GET /life_events?event_type=eq.milestone&order=event_year.asc
```

---

## Media

### Get Media for a Person
```
GET /media?person_id=eq.{id}&order=year_taken.desc
```

### Upload Media
```
POST /storage/v1/object/media/{filename}
Content-Type: multipart/form-data

# Then create media record:
POST /media
Body: {
  "person_id": "uuid",
  "media_type": "photo",
  "url": "storage-url",
  "caption": "Family gathering 1975",
  "year_taken": 1975
}
```

---

## Edit Proposals (Moderation)

### List Pending Proposals (admin/editor)
```
GET /edit_proposals?status=eq.pending&order=created_at.desc
```

### Approve Proposal
```
PATCH /edit_proposals?id=eq.{id}
Body: {
  "status": "approved",
  "reviewed_by": "reviewer-uuid",
  "review_note": "Verified with family elder"
}
```

### Reject Proposal
```
PATCH /edit_proposals?id=eq.{id}
Body: {
  "status": "rejected",
  "reviewed_by": "reviewer-uuid",
  "review_note": "Dates need verification"
}
```

---

## Proverbs

### Get Random Proverb
```
GET /proverbs?order=random()&limit=1
```

### Get Clan-specific Proverbs
```
GET /proverbs?clan_id=eq.{clan_id}
```

---

## QR Codes

### Generate QR for Person
```
POST /qr_codes
Body: {
  "person_id": "uuid",
  "short_code": "koo-mzr-001",
  "purpose": "gravestone"
}
```

### Resolve QR Code
```
GET /qr_codes?short_code=eq.koo-mzr-001&select=person_id
```

---

## User Profiles

### Get Current User Profile
```
GET /profiles?id=eq.{auth.uid}
```

### Update Profile
```
PATCH /profiles?id=eq.{auth.uid}
Body: {
  "display_name": "Rashid Mwinyi",
  "avatar_url": "url"
}
```
