Content is user-generated and unverified.
REALBOOK — COMPLETE PROJECT CONTEXT
Read this file before making ANY changes to the project
Last Updated: May 2026 — Version 5 (Final)
Claude is Lead PM. Build FASTEST stable MVP. Avoid overengineering.
🚨 PRIORITY RULE
Build FASTEST stable MVP possible.
Prefer simple maintainable solutions.
Avoid overengineering.
One feature at a time.

🎯 WHAT IS REALBOOK?
Realbook is a private social network for real estate agents in Pakistan. NOT a property portal like Zameen.com. LIKE LinkedIn + WhatsApp Groups + Inventory Management for agents only.

Problem: Pakistani agents navigate 1000s of WhatsApp groups daily. Solution: One organized, searchable, networked platform. Tagline: "Leave 1000 WhatsApp groups. Join Realbook."

👤 TARGET USER
Pakistani real estate agents (dealers)
Launch cities: Rawalpindi + Islamabad TOGETHER first
Then: Lahore → Karachi → All Pakistan
Platform: Android + iPhone + Web
Language: English only
👥 USER ROLES
guest           → can see AND search everything, cannot participate
pending_agent   → signed up, waiting admin approval
verified_agent  → fully approved, full access
admin           → full control of everything
banned          → no access
👁️ VISIBILITY RULES
"See everything. Login to participate."
Guest CAN see:
✅ Full listing details
✅ All photos (watermarked)
✅ All tags and property details
✅ Phone number
✅ Agent name + agency + full profile
✅ Documents
✅ Comments (read only)
✅ Offers (read only)
✅ Search with all filters
✅ Browse all listings
✅ Requirements (read only)
✅ Visiting card on agent profile
Guest CANNOT participate:
❌ Post listing
❌ Make offer
❌ Write comment
❌ Chat with agent
❌ Follow agent
❌ Bookmark/save listing
❌ Post requirement
Connected agents only:
Documents (allotment, registry etc)
Admin ONLY:
Agent CNIC — never shown to anyone else ever
Record Room — all historical data
🔐 AUTHENTICATION
Login: Mobile number + Password ONLY
NO OTP — Pakistani networks block OTPs, previous app failed
NO EMAIL — anywhere in the app
Signup requires BOTH:
Visiting Card (front + back) → PUBLIC on profile
CNIC (front + back) → ADMIN ONLY, never shown publicly
Admin manually approves within 24 hours
Signup Flow:
Step 1 — Upload Documents
  ├── Visiting Card → PUBLIC on profile
  └── CNIC → ADMIN ONLY

Step 2 — Fill Details
  ├── Name, Agency, City, Office Address
  └── Expertise areas (multi-select)

Step 3 — Set Password
  └── Mobile number + password

Step 4 — Pending Approval Screen
  └── Admin reviews within 24 hours
🗂️ PROJECT FOLDER STRUCTURE
/src
  /components      # Reusable UI components
  /screens         # All app screens
  /navigation      # All navigation stacks and tabs
  /services        # ALL Firebase calls go here ONLY
  /firebase        # Firebase config and initialization
  /hooks           # Custom React hooks
  /utils           # Helper functions
  /constants       # Colors, societies, property types (see societies.ts)
  /store           # React Context (auth + global state)
  /types           # TypeScript types and interfaces
  /admin           # Admin panel screens (web only)
Rules:

TypeScript everywhere
Functional components only
React Navigation consistently
Reusable UI components always
ALL Firebase calls through /src/services/ ONLY
🗺️ NAVIGATION ARCHITECTURE
Auth Stack:
  ├── Login Screen
  ├── Signup Screen
  └── Pending Approval Screen

Main Tabs (verified_agent only):
  ├── Feed Tab (List Mode + Tinder Mode toggle)
  ├── Search Tab (filters only first)
  ├── Post Tab (+ button)
  ├── Agents Tab
  └── Profile Tab

Modal/Stack Screens:
  ├── Listing Detail
  ├── Chat (private)
  ├── Public Chat on Listing
  ├── Offers Screen
  ├── Notifications
  ├── Requirements Screen
  ├── Monthly Tinder Review Screen
  └── Admin Panel (admin role only)
🏗️ STATE MANAGEMENT
Use:
- React Context → auth state + global user data
- Local component state → everything else
- NO Redux
- NO Zustand
📸 IMAGE UPLOAD FLOW (SECURITY CRITICAL)
CORRECT:
App → Firebase Cloud Function → Cloudinary → URL → Firestore

NEVER:
App → directly to Cloudinary (exposes API keys)
Cloudinary: q_auto, w_400, c_fill for feed images Watermark: "Agent Name | Realbook" on ALL photos

🚀 MVP — BUILD THESE FIRST
✅ Build now:
- Auth (login + signup + pending)
- Feed (List Mode + Tinder Mode toggle)
- Post listing (full flow)
- Search with filters (filters first)
- Listing detail screen
- Agent profiles
- Follow system
- Private chat
- Public chat on listings
- Comments
- Notifications
- Requirements system
- Monthly Tinder review
- Admin panel (basic)

❌ DO NOT BUILD YET:
- Ratings system
- WhatsApp API integration
- JazzCash payments
- Record Room access payment
- Advanced analytics
- Group chats
- Rental listings
- Urdu language
🏠 PROPERTY LISTINGS
SALE ONLY — No rentals Phase 1
NO AUTO-EXPIRY
Listings stay until:

Agent marks SOLD (Tinder swipe left monthly)
Agent manually deletes
Agent archives
4 LISTING STATES:
ACTIVE ✅
→ Visible to everyone
→ In feed
→ Can refresh to top

ARCHIVE 📦
→ Hidden from feed
→ Agent can restore to Active
→ Agent can move to Record Room

SOLD ❌
→ Hidden from feed
→ Automatically moves to Record Room
→ Preserved forever

RECORD ROOM 🗄️
→ Never deleted — EVER
→ Admin sees all
→ Paying agents see (₨1000/year)
→ Price history goldmine
→ Market data preserved forever
MONTHLY TINDER REVIEW:
1st of every month:
Agent sees popup → "Review your listings!"
      ↓
Tinder-style cards appear one by one
      ↓
Swipe RIGHT → Still ACTIVE ✅
Swipe LEFT → Mark as SOLD ❌
Ignore/Skip → Moves to ARCHIVE 📦
      ↓
Takes 2 minutes — keeps database clean
📱 FEED — TWO VIEWING MODES
Toggle switch at top of feed:
List Mode (default):

Standard card list
Scroll through listings
See multiple at once
Tinder Mode:

Full screen cards
Swipe RIGHT = Bookmark/Interested ✅
Swipe LEFT = Pass/Skip ❌
Tap card = Open full detail
Swipe UP = Make offer instantly
Fun, fast, engaging
Nobody in Pakistan real estate has this!
Feed Priority Order:
Connected/Friend agents listings
Same expertise area agents
All other listings
Feed Tabs:
Friends
My Area
All
💰 MONETIZATION — COMPLETE MODEL
Feature	Cost	Type
First 2 listings/day	FREE	Daily (no carry forward)
After 2 listings/day	₨50 each	Per listing
First 10 refreshes/month	FREE	Monthly reset
After 10 refreshes	₨10 each	Per refresh
Record Room access	₨1000/year	Yearly subscription
Key Rules:
2 free listings reset DAILY — unused ones DON'T carry forward
10 free refreshes reset MONTHLY
Refresh = listing bumps to TOP of feed
Record Room = full price history access for 1 year
JazzCash payments only
WhatsApp receipt after every payment
Server-side payments only (Firebase Cloud Functions)
Admin can give free listings/refreshes to agents
📋 PROPERTY SPECIFIC FIELDS
1. RESIDENTIAL PLOT:
Level: Level / Raised / Lowered
Facing: North / South / East / West
Street width (feet)
Corner, Park facing, Main boulevard: Yes/No
2. COMMERCIAL PLOT:
Approval: LDA / RDA / CDA / DHA / Bahria / Unapproved / Under Process
Commercial activity, Multi-storey, Basement: Yes/No
3. HOUSE:
Currently rented + rental income + vacating timeline
Construction: Brand New / Used (years old)
Quality: Grey / Partially / Fully finished
Furnished: Furnished / Unfurnished / Semi
Floors, Servant quarter, Separate gate, Basement: Yes/No
4. APARTMENT/FLAT:
Floor number, Total floors
Parking (spots), Lift: Yes/No
Type: Above shops / Standalone
Furnished, Generator: Yes/No
Currently rented + rental income
5. SHOP:
Currently rented + rental income + vacating
Floor: Ground / First / Second / Basement
Mezzanine: Yes/No
6. OFFICE:
Furnished: Furnished / Unfurnished / Semi
Floor number, Lift, Parking: Yes/No
Currently rented + rental income
7. FARM HOUSE:
Dimensions (length x width feet) — MANDATORY
Map attachment — MANDATORY
Google location — MANDATORY
Boundary wall, Tube well, Electricity: Yes/No
8. FILE:
Balance amount (₨) — MANDATORY
Statement attachment — MANDATORY
Ballot done: Yes/No
Possession expected (date)
9. INDUSTRIAL PLOT:
Industrial estate name — MANDATORY
Gas, Electricity, Water, Road access: Yes/No
10. PENTHOUSE:
Floor number, Total floors
Rooftop access + area (sqft)
Private elevator, Generator, Pool, Gym: Yes/No
Furnished: Furnished / Unfurnished / Semi
Views: City / Park / Main road / Multiple
Parking spots, Servant quarter: Yes/No
🏷️ COMMON FIELDS (All Types)
Pakistani Property Status:
Possession: Available / File Only / Under Process
Registry: Done / Available / Not Available
Map: Paid / Not Paid
Dues: Clear / Pending (amount)
NOC: Available / Not Available
Special Tags:
Corner, Extra Land, Park Facing, On Biana, One Down, Two Down,
Direct Owner, Solid Land, File Only, Merging Possible, Cash Only,
Main Boulevard, Gated, Sun Facing
[MORE TAGS — owner providing full list later]

Transfer & Timing:
Biana remaining time
Transfer available date
Owner availability date
Cash only, Merging possible: Yes/No
Media:
Multiple photos (carousel in detail)
One video
ALL watermarked: "Agent Name | Realbook"
Documents (CONNECTED AGENTS ONLY)
You Are: Direct Owner / Dealer / Co-Dealer
🔍 SEARCH SYSTEM
Filters ONLY first — no results until filter applied
Available to EVERYONE including guests (SEO benefit)
See societies.ts for complete dropdown data
General Filters:
Property Type, Society, Phase/Block, Price Range,
Size (Marla/Kanal/Sqft), Special Tags,
Possession Status, Legal Status, Transfer & Timing

Synonym Map (NO AI):
50 terms from owner later.
Placeholder: "More Filters Coming Soon"

📢 REQUIREMENTS SYSTEM
(Previously called "Demands" — now called REQUIREMENTS)
Agent posts what they need to buy
Maximum 3 requirements per month
Requirement MUST have specific area
Area-based notification (NOT AI) — simple database lookup
Shows in feed as public post
Normal or Urgent flag
Read by guests (participate = login required)
💬 COMMENTS SYSTEM
Any logged in agent can comment
Public — everyone can read (including guests)
Agent deletes own listing comments
Replies allowed
Comment count on card
Profile listings ranked by comments
3 Separate Interactions:
Feature	Read	Participate
Comment	Everyone	Login required
Offer	Everyone	Login required
Private Chat	Connected only	Login required
👥 NETWORK
Twitter-style follow
Connection = mutual follow
Contact import from phone
NO groups Phase 1
💬 CHAT
Public chat on listings
Private chat (connected agents)
Voice notes in public only
Share listing in chat
Online/offline status
NO group chat Phase 1
🔔 NOTIFICATIONS
New requirement in your area
New offer on listing
New comment + reply
New follower
Listing marked sold
Fraud report
Admin approval/rejection
Friend posts listing
Monthly review reminder (1st of month)
Free refresh running low
NOT: Daily digest, views alert, email

🛡️ SECURITY
Report fake listing/agent
Auto-delete after 5 reports
Block agents (blocked can't see listings)
Any agent can mark SOLD
Duplicate → both notified
Watermark all photos
Mark agent FRAUD
NO auto account freeze
🗄️ RECORD ROOM
Contains ALL sold + deleted listings FOREVER
Nothing ever truly deleted from database
Admin sees everything always (free)
Verified agents pay ₨1000/year to access
Contains: price history, sale dates, agent info
Future use: market analytics, price trends
Most valuable data asset of Realbook
⚡ PERFORMANCE (Non-Negotiable)
✅ Always:
- FlatList (NEVER ScrollView for lists)
- React.memo on cards
- useCallback + useMemo
- Skeleton loaders
- Pull to refresh on feed
- Pagination (10 items max)
- expo-image for images
- AsyncStorage offline cache
- Compress before upload

❌ Never:
- ScrollView for feeds
- Load all data at once
- Heavy animations
- Direct Firebase in screens
Target: Smooth on 4GB RAM Android, 3G/4G Pakistan.

🗄️ FIRESTORE STRUCTURE
users/{uid}
  - name, phone, agency, city
  - role: guest/pending_agent/verified_agent/admin/banned
  - expertise_areas[], property_types[]
  - verified, status
  - blocked_users[], followers[], following[]
  - daily_listings_used, daily_listings_reset_date
  - monthly_refreshes_used, monthly_refreshes_reset_date
  - record_room_access: bool
  - record_room_expiry: date
  - visiting_card_url (public)
  - cnic_url (admin only)
  - created_at

listings/{lid}
  - agent_id, type, society, phase
  - size, size_unit, price, bedrooms
  - tags[], possession_status
  - registry_status, map_status, dues_status
  - biana_info, transfer_info
  - merging, cash_only
  - photos[], video_url
  - documents[] (connected only)
  - views, comment_count, refresh_count
  - last_refreshed_at
  - status: active/archive/sold/record_room
  - last_reviewed_at (monthly tinder review)
  - created_at
  - property_specific_fields: {}

comments/{cid}
  - listing_id, agent_id, text
  - replies[], created_at

requirements/{rid}
  - agent_id, need, area
  - budget_min, budget_max
  - urgent, month_year, created_at

offers/{oid}
  - listing_id, agent_id
  - amount, message
  - counter_offers[], created_at

chats/{chat_id}
  - participants[]
  - messages/{mid}
    - text, voice_url, listing_id
    - sender_id, created_at
  - last_message

reports/{rep_id}
  - reporter_id, reported_id
  - type: listing/agent
  - reason, created_at

payments/{pid}
  - agent_id, amount
  - type: listing/refresh/record_room
  - jazzcash_ref
  - status: pending/success/failed
  - created_at

notifications/{uid}/{nid}
  - type, message, read, created_at

record_room/{lid}
  - all listing fields preserved
  - sold_date, sold_price
  - agent_id, agency
  - archived_reason
  - created_at
🏙️ SOCIETIES
See societies.ts file for complete Twin Cities taxonomy.
Rawalpindi + Islamabad fully mapped with all sub-blocks.
More cities added via admin panel later.

🎨 DESIGN
WhatsApp style — simple and friendly
Primary: 
#25D366
Dark: 
#128C7E
Background: 
#F0F2F5
Cards: 
#FFFFFF
NOT blue, NOT dark
Skeleton loaders on all loading states
Photo carousel on listing detail
Tinder mode cards — full screen, swipeable
📊 ADMIN PANEL
Separate web app (React)
Firebase Hosting, password protected
Approve/reject agents (CNIC + visiting card)
Block, delete, archive listings
Free listings/refreshes to agents
Broadcast messages
Payments history
Fraud reports
Manage societies + filters
Full Record Room access
Market analytics dashboard
🚀 LAUNCH STRATEGY
Month 1-2: Rawalpindi + Islamabad → 100 agents
Month 3-4: + Lahore → 300 agents
Month 5-6: + Karachi → 600 agents
Month 6+: All Pakistan → 2000+ agents
❌ NEVER BUILD
AI features (ever)
OTP (ever)
Email anywhere (ever)
Map view for properties
Featured/sponsored listings
Daily digest
Group chats (Phase 1)
Rental listings (Phase 1)
Urdu language (Phase 1)
Search by rating
Save search filters
Auto-expiry of listings
Custom backend
Microservices
GraphQL
AWS
📝 PENDING
50+ extended filters — owner providing
50 synonym map terms — owner providing
More societies beyond Twin Cities — admin panel
JazzCash API credentials
Cloudinary credentials
⚠️ GOLDEN RULES FOR CURSOR
Read this file before ANY change
No AI — ever
No OTP — ever
No email — ever
Green (
#25D366) not blue
One feature at a time
Pakistani real estate terms always
Rawalpindi + Islamabad = launch cities
Performance first — mid-range Android
Paginate always — never load all data
NO listing auto-expiry
Visiting card = PUBLIC on profile
CNIC = ADMIN ONLY — never shown
Comments ≠ Offers ≠ Private Chat
ALL Firebase calls through /src/services/ ONLY
Demands are called REQUIREMENTS
Record Room = never delete data
Feed has List Mode AND Tinder Mode
Monthly Tinder review on 1st of month
2 free listings/day — no carry forward
