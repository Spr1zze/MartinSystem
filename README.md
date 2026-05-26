# Martin Inventory System

## Overview

An inventory management system tailored for Martin's "Process operatør" students. The system tracks product inventory, logs items taken from stock, and records work activities. Currently runs as a local Electron application on a single classroom laptop. Future versions will support multi-device access with backend and database running on separate infrastructure.


## Features

- **Inventory Management** — Track all products, quantities, units, and types
- **Checkout Logging** — Log when students take items from inventory
- **Work Logging** — Record work activities and process documentation
- **Admin Panel** — Manage inventory, users, and view system statistics
- **Barcode Support** — Generate and scan barcodes for items
- **Search & Filter** — Find items by name, type, date range, and stock status


## Tech Stack

- **Frontend:** React with Vite and Tailwind CSS
- **Backend:** C# with ASP.NET Core and Entity Framework Core
- **Database:** SQLite (local), will migrate to server-based database
- **Desktop App:** Electron wrapper for local execution


## Quick Start
Look for root file "package.json" to see all pre-defined scripts I personally created.


### Development (Browser)

├── frontend/          # React application (UI)
├── backend/           # C# ASP.NET Core API and business logic
├── public/            # Electron main process (main.js)
├── dist/              # Built Electron application (after npm run electron-build)
└── package.json       # npm scripts and Electron configuration


## Database

**Location:** `C:\Users\[Username]\AppData\Roaming\martin-inventory\inventory.db`

The database persists locally on the teacher's machine. Application updates do not affect the database.

### Creating Database Migrations

When the data model changes, create a migration:

```bash
cd backend
dotnet ef migrations add DescriptionOfChange
cd ..
npm run electron-build
```

When the teacher runs the new application, migrations apply automatically.


## Installation (Teacher)

1. Receive the `.exe` file on USB
2. Plug USB into classroom laptop
3. Run the `.exe` file
4. Application installs and opens automatically
5. All data is saved locally

## Updating (Teacher)

1. Receive new `.exe` file on USB
2. Run the new `.exe` to update
3. **Do not delete files from AppData** — your data will persist
4. All previous inventory and logs remain intact

## API Endpoints

### Inventory
- `GET /api/inventory` — Get all items
- `GET /api/inventory/{id}` — Get item by ID
- `GET /api/inventory/search` — Search items with filters
- `GET /api/inventory/types` — Get all item types
- `POST /api/inventory` — Create new item
- `PUT /api/inventory/{id}` — Update item
- `DELETE /api/inventory/{id}` — Delete item

### Checkout & Logging
- `POST /api/checkout/validate-student` — Validate student by ID
- `POST /api/checkout/validate-barcode` — Validate item by barcode
- `POST /api/checkout/create-log` — Create checkout log

### Work Logs
- `GET /api/worklog` — Get all work logs
- `POST /api/worklog/create-log` — Create work log

### Admin
- `GET /api/admin/students` — Get all users
- `GET /api/admin/dashboard-stats` — Get system statistics

## Known Issues & Limitations

- Backend and database must run on the same device (single-device only)
- No multi-device access yet
- No cloud backup of data
- Database changes require application rebuilds

## Future Work

- **Multi-Device Support:** Backend and database on separate server/Pi
- **Online Service:** Access from multiple devices across school
- **Additional Features:** Talk with Martin to determine specific needs
- **Database Migration:** Migrate from SQLite to server-based database for scalability
- **Support for Multiple Schools:** Expand system for other institutions

## Development Commands

See `package.json` for all available npm scripts. Key commands:

- `npm run dev` — Run Electron app
- `npm run dev-browser` — Run in browser
- `npm run build-backend` — Compile C# backend
- `npm run build-frontend` — Build React app
- `npm run electron-build` — Create distributable `.exe`

## Questions or Issues?

**Original Developer:** Joachim Siedler  
**Contact:** siedlerbjoachim@hotmail.com

---
