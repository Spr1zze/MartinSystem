# Architecture & Design Decisions

## Why Electron?

Electron was chosen because:
- Simple setup and deployment — single `.exe` file
- Cross-platform capable (Windows/Mac/Linux with minimal changes)
- Wraps entire application (frontend + backend) into one package
- Teacher doesn't need to manage multiple applications or ports
- Easy to update — replace `.exe`, data persists


## Why SQLite for Martin's System?

- **Lightweight** — No server needed, minimal resource usage
- **Low Maintenance** — File-based database, no setup required
- **Local Storage** — All data stays on the classroom laptop
- **Perfect for Single-Device** — Current architecture needs only one user at a time

SQLite will be replaced with a server-based database (PostgreSQL, SQL Server, etc.) when the system migrates to multi-device access on a Raspberry Pi.


## Why Services + Controllers Pattern?

The backend uses a clear separation of concerns:
Controller (HTTP Layer)
↓
Service (Business Logic)
↓
Database (Data Access)


**Benefits:**
- Business logic is testable and reusable
- Controllers stay thin (just HTTP handling)
- Easy to modify logic without touching HTTP layer
- Multiple controllers can use the same service


## Why Atomic Operations for Checkout?

When a student checks out an item:

1. Deduct quantity from inventory
2. Create checkout log entry

Both must succeed or both must fail. If one fails, data becomes inconsistent.

Solution: Perform both operations in one service method. If anything fails, the entire operation rolls back.


## Database Location Strategy

Database stored in: `AppData\Roaming\martin-inventory\`

**Why AppData?**
- Application updates don't touch this folder
- Teacher has write permissions
- Data persists across application versions
- Windows standard location for application data

**Why not in app folder?**
- Building new `.exe` could delete database
- Not ideal for long-term data persistence
- Harder to back up or share


## Frontend Architecture

**React + Vite:**
- Vite provides fast development with hot module reloading
- React component-based UI
- Tailwind CSS for styling without custom CSS files

**Context API for State:**
- Auth context for login state
- Notification context for error/success messages

**Service Layer:**
- All API calls go through `/src/services/`
- Single source of truth for backend URLs
- Easy to switch between localhost (dev) and production URLs


## Backend Architecture

**ASP.NET Core Controllers:**
- One controller per feature (InventoryController, CheckoutController, etc.)
- RESTful endpoints
- CORS enabled for local frontend

**Services:**
- Contain business logic and database queries
- Injected into controllers via dependency injection
- Entity Framework Core handles database operations

**Entity Framework Core:**
- ORM (Object-Relational Mapping)
- Models define database schema
- Migrations track schema changes


## Electron Wrapper

**main.js Process:**
- Spawns backend `.exe` as subprocess on app start
- Waits for backend to be ready (health check)
- Opens React frontend in Electron window
- Terminates backend when app closes

**File Structure:**
- Frontend compiled to `/frontend/dist/`
- Backend published to `/backend/bin/Release/net10.0/publish/`
- Electron bundles both into single `.exe`


## Update Strategy

**Without Data Loss:**
1. Developer makes changes
2. Creates migrations if schema changes
3. Builds new `.exe`
4. Teacher runs new `.exe`
5. Migrations apply automatically
6. Data in AppData folder untouched

**Key:** Database is separate from application files.


## Future Architecture: Multi-Device Support

**Current (Single Device):**
Laptop
├── Electron App
├── Backend Process
└── SQLite Database

**Future (Multi-Device):**
Raspberry Pi (or Server)
├── Backend Service
└── Database
Classroom Laptops (Multiple)
├── Frontend App
└── (connects to Pi backend)
Mobile Devices (Optional)
└── Web/Mobile App (connects to same backend)

**Changes Needed:**
- Backend deployed as web service (not subprocess)
- Database on dedicated server
- Frontend points to remote backend URL
- Authentication required (multiple users)
- Data sync across devices


## Why This Architecture for Martin?

Martin's current needs:
- Single classroom, single laptop
- Teacher is only admin
- Local offline operation
- Simple deployment

This architecture handles those needs perfectly. When he needs multi-device access, the backend/database layers are already separated and can be moved to a server with minimal code changes.


## Scalability Considerations

Current system can handle:
- ~1,000 inventory items
- ~10,000 log entries
- Single concurrent user
- Offline operation indefinitely

When scaling:
- Migrate to server-based database
- Add authentication layer
- Implement API rate limiting
- Add caching layer
- Consider load balancing for multiple devices

---
