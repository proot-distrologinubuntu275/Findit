# 🎓 CampusTrack - College Lost & Found Portal

A full-stack, responsive web application designed for college campuses where students and faculty can file applications for lost items, log found belongings, upload photographs, verify ownership through claim verification, and connect safely to retrieve their belongings.

---

## 🌟 Key Features

1. **Post Applications with Photo Uploads**:
   - **"I Lost Something"**: Report lost items with category, description, campus location, date/time, contact info, and photos.
   - **"I Found Something"**: Report belongings found on campus. Includes an optional **Anti-Fraud Security Question** (e.g. *"What color is the keychain?"* or *"What sticker is on the back?"*) so only legitimate owners can claim it.
2. **Proper Database Architecture**:
   - Relational database schema with **SQLite** managed through **Prisma ORM**.
   - Structured tables: `User`, `Item`, `Claim`, and `Notification`.
   - Local disk storage with **Multer** for item photos and verification proof uploads.
3. **Claim & Contact Verification Flow**:
   - Students can file an ownership claim answering the security question or providing unique identifiers.
   - Optional claimant evidence photo upload (e.g. receipt, student ID card, old photo with the item).
   - Item poster reviews and can **Approve** or **Reject** claims with one click.
   - When approved, item is automatically marked **Resolved** and contact details are exchanged.
4. **Real-Time Notification Inbox**:
   - Posters receive in-app notification badges when new claims are submitted.
   - Claimants receive celebration alerts when their claim is approved.
5. **Search & Filter Engine**:
   - Instant live search across item titles, locations, and descriptions.
   - Filter by Type (Lost / Found / All), Category (Electronics, ID Cards, Keys, Wallets, Books, etc.), and status.
6. **Campus Security / Admin Panel**:
   - Overview metrics for campus security desk.
   - Manage student directory and roles.
   - Moderate or delete spam listings.
7. **Viva/Demo Ready**:
   - One-click demo login buttons (Campus Admin, Rahul Sharma, Priya Patel) on the sign-in page.

---

## 🏗️ Architecture & Tech Stack

```mermaid
graph LR
    subgraph Frontend [React Frontend (Port 5173)]
        UI[Vite + React 19]
        TW[Tailwind CSS]
        Lucide[Lucide Icons]
        Axios[Axios API Client]
    end

    subgraph Backend [Node.js Express Backend (Port 5000)]
        API[Express REST API]
        Auth[JWT & Bcrypt]
        Multer[Multer File Storage]
        Prisma[Prisma ORM Client]
    end

    subgraph Database [Database & Storage]
        DB[(SQLite - dev.db)]
        Uploads[Static /uploads Directory]
    end

    UI --> Axios
    Axios -->|Proxy Requests| API
    API --> Auth
    API --> Multer
    Multer --> Uploads
    API --> Prisma
    Prisma --> DB
```

- **Frontend**: React 19, Vite, Tailwind CSS v4, React Router 7, Lucide React, Axios
- **Backend**: Node.js, Express 5, JWT, BcryptJS, Multer
- **Database & ORM**: SQLite (`dev.db`), Prisma ORM 6.4

---

## 🗄️ Database Schema (`prisma/schema.prisma`)

```prisma
model User {
  id            Int            @id @default(autoincrement())
  name          String
  email         String         @unique
  password      String
  phone         String?
  collegeId     String?        // Student Roll No / ID
  role          String         @default("STUDENT") // STUDENT or ADMIN
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  items         Item[]
  claims        Claim[]
  notifications Notification[]
}

model Item {
  id               Int       @id @default(autoincrement())
  title            String
  description      String
  category         String    // Electronics, ID Cards, Keys, etc.
  type             String    // LOST or FOUND
  status           String    @default("OPEN") // OPEN, CLAIM_PENDING, RESOLVED
  location         String    // e.g. "Library 2nd Floor"
  date             DateTime
  imageUrl         String?   // Local photo path in /uploads
  securityQuestion String?   // Verification question for found items
  contactEmail     String?
  contactPhone     String?
  userId           Int
  user             User      @relation(fields: [userId], references: [id])
  claims           Claim[]
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
}

model Claim {
  id              Int       @id @default(autoincrement())
  itemId          Int
  item            Item      @relation(fields: [itemId], references: [id])
  claimantId      Int
  claimant        User      @relation(fields: [claimantId], references: [id])
  status          String    @default("PENDING") // PENDING, APPROVED, REJECTED
  message         String
  proofImageUrl   String?
  claimantContact String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model Notification {
  id        Int      @id @default(autoincrement())
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  title     String
  message   String
  link      String?
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

---

## 🚀 Running the Project

### Prerequisites
- Node.js (v18 or higher)
- npm

### 1. Backend Server Setup
Open a terminal in the `server` folder:
```bash
cd server
npm install
node src/seed.js      # Populates database with sample college items & accounts
npm run dev           # Runs server on http://localhost:5000
```

### 2. Frontend Client Setup
Open a second terminal in the `client` folder:
```bash
cd client
npm install
npm run dev           # Runs client on http://localhost:5173
```

Visit **http://localhost:5173** in your browser.

---

## 🔑 Demo & Test Accounts

You can log in instantly with the 1-click preset buttons on the Login page, or enter:

| Role | Email | Password | Details |
|------|-------|----------|---------|
| **Campus Admin / Security** | `admin@college.edu` | `admin123` | Security desk with moderation powers |
| **Student 1** | `rahul.s@college.edu` | `password123` | CS Dept (Has reported lost calculator & headphones) |
| **Student 2** | `priya.p@college.edu` | `password123` | ECE Dept (Has reported lost ID card) |
| **Student 3** | `ananya.v@college.edu` | `password123` | Mech Dept (Found bike keys with Spider-Man keychain) |

---

## 📋 API Endpoints Reference

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Create student account | Public |
| POST | `/api/auth/login` | Sign in & receive JWT | Public |
| GET | `/api/auth/me` | Current user profile | Authenticated |
| GET | `/api/items` | List & filter lost/found items | Public |
| GET | `/api/items/stats` | Homepage campus metrics | Public |
| GET | `/api/items/:id` | Item application details | Public |
| POST | `/api/items` | Post new lost/found item (+ photo) | Authenticated |
| PUT | `/api/items/:id` | Edit item / update status | Owner / Admin |
| DELETE | `/api/items/:id` | Delete item | Owner / Admin |
| POST | `/api/claims` | Submit claim on an item (+ photo) | Authenticated |
| PUT | `/api/claims/:id/status` | Approve or Reject claim | Owner / Admin |
| GET | `/api/claims/my` | User's submitted claims | Authenticated |
| GET | `/api/claims/notifications` | User's notification inbox | Authenticated |
| GET | `/api/admin/overview` | Campus security metrics & users | Admin Only |
| PUT | `/api/admin/users/:id/role`| Promote/demote user role | Admin Only |
