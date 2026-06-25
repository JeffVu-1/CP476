# Book It. — Service Booking Platform

> **CP476B – Internet Computing | Spring 2026**
> Full-Stack Web Application | Group Capstone Project

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Team Members](#team-members)
5. [Repository Structure](#repository-structure)
6. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Database Setup](#database-setup)
   - [Running the Application](#running-the-application)
7. [Environment Configuration](#environment-configuration)
8. [Database Schema Overview](#database-schema-overview)
9. [API Routes Overview](#api-routes-overview)
10. [Security Practices](#security-practices)
11. [Testing](#testing)
12. [Project Management](#project-management)
13. [License](#license)

---

## Project Overview

**Book It.** is a full-stack web application that acts as a central hub connecting customers with local and online service providers. It eliminates the need to visit multiple websites to book different services by offering two discovery modes:

- **Category Browsing** — Explore services organized into categories such as Hair Styling, Lawn Care, Graphic Design, Tutoring, Home Repair, Cleaning, Fitness Training, Photography, and Consulting.
- **Natural-Language Search** — Describe a problem (e.g., *"My lawn is very dry and I want to make it look better"*) and receive relevant service suggestions via keyword matching.

Once a customer finds a service, they can view details, select a date, choose an available time slot, and confirm a booking — all in one place. Service providers manage their listings and incoming bookings through a dedicated dashboard.

**In Scope:**
- User registration and login (customer and provider roles)
- Service listing creation, editing, and deletion by providers
- Category-based service browsing and natural-language keyword search
- Service detail page with date and time-slot selection
- Appointment booking, viewing, and cancellation
- Provider and customer dashboards
- Server-side and client-side input validation
- Basic security hygiene: parameterized queries, XSS prevention

**Out of Scope:**
- Payment processing
- Real-time messaging
- Email/SMS notifications
- Full AI/ML natural-language processing
- Mobile native app

---

## Features

### Must Have
- User registration and login for customers and service providers (role-based)
- Service listing management — Create, Read, Update, Delete (CRUD) by providers
- Category-based service browsing
- Service detail page (description, category, price, duration, delivery mode, provider info)
- Time-slot availability management by providers
- Appointment booking by customers (create, view, cancel)
- Provider dashboard — view and manage all incoming bookings
- Customer dashboard — view upcoming and past bookings
- Server-side input validation on all forms and API routes
- SQL injection prevention via parameterized queries through Supabase client

### Should Have
- Natural-language keyword-matching search
- Booking status lifecycle: Pending → Confirmed → Completed / Cancelled
- Service search and filter by category, keyword, or price range
- Review and star-rating system (1–5 stars) for completed bookings
- Customer and provider profile edit pages

### Could Have (Stretch Goals)
- Admin panel to moderate service listings
- Starred / Favourited services list
- Printable booking confirmation page
- Service image upload
- Paginated service listing results

---

## Technology Stack

| Layer | Technology |
|---|---|
| Front-End | Next.js (React, JavaScript) |
| Back-End | Next.js API Routes (Node.js) |
| Front-End & API Hosting | Vercel |
| Database | PostgreSQL (via Supabase) |
| Database Hosting | Supabase (cloud-hosted) |
| Version Control | Git, GitHub |
| Project Management | GitHub Projects (Kanban) |
| Documentation | GitHub Wiki (Markdown) |

---

## Team Members

| Name | Student ID | Role |
|---|---|---|
| Zulqarnayeen Sadid | 169075017 | Project Manager |
| Jeff Vu | 169058539 | Front-End Lead |
| Hamza Mohammed | 169061024 | Front-End Developer |
| Arren Haroutunian | 210603250 | Front-End Developer |
| Gurnivaj Tiwana | 169033176 | Back-End Lead |
| Harshaan Rehal | 169057121 | Back-End Developer |
| Dawood Ahmed | 169046795 | Back-End Developer |
| Moosa Ahmed | 169046796 | Database Architect |
| Pushti Nakum | 169053401 | Security & Testing Lead |
| Fatma Mohamed Yasin | 169075296 | Documentation Lead |

---

## Repository Structure

```
book-it/
├── README.md                        ← This file (in parent CP476/ directory)
├── .gitignore
├── jsconfig.json
├── next.config.mjs                  ← Next.js configuration
├── package.json
├── package-lock.json
│
├── app/                             ← Next.js App Router root
│   ├── layout.js                    ← Root layout (wraps all pages with nav)
│   ├── globals.scss                 ← Global stylesheet
│   │
│   ├── (home)/
│   │   ├── page.js                  ← Homepage (category grid + search bar)
│   │   └── page.module.scss
│   │
│   ├── (pages)/                     ← Route group for secondary pages
│   │   ├── browse/
│   │   │   ├── page.js              ← Browse / search results listing
│   │   │   └── page.module.scss
│   │   ├── categories/
│   │   │   ├── page.js              ← Category overview page
│   │   │   └── page.module.scss
│   │   ├── for-business/
│   │   │   ├── page.js              ← Provider landing / info page
│   │   │   └── page.module.scss
│   │   ├── login/
│   │   │   ├── page.js
│   │   │   └── page.module.scss
│   │   └── signup/
│   │       ├── page.js
│   │       └── page.module.scss
│   │
│   └── api/                         ← Next.js API Routes (back-end endpoints)
│       └── categories/
│           └── route.js             ← GET /api/categories
│
├── components/                      ← Shared React components
│   ├── categoryGrid/
│   │   ├── categoryGrid.js
│   │   └── categoryGrid.module.scss
│   ├── navigationHeader/
│   │   ├── navigationHeader.js
│   │   ├── navigationHeader.module.scss
│   │   └── ConditionalNav.js        ← Hides nav on login/signup pages
│   └── searchBar/
│       ├── searchBar.js
│       └── searchBar.module.scss
│
└── lib/
    └── supabase.js                  ← Supabase client initialization
```

---

## Getting Started

### Prerequisites

Ensure the following are installed before proceeding:

- **Node.js** — [https://nodejs.org](https://nodejs.org)
- **npm** (included with Node.js)
- **Git** — [https://git-scm.com](https://git-scm.com)
- A **Supabase** account — [https://supabase.com](https://supabase.com)

---

### Database Setup

The application uses **Supabase** as its cloud-hosted PostgreSQL database. No local database installation is required.

**1. Create a Supabase project.**

- Go to [https://supabase.com](https://supabase.com) and sign in.
- Click **New Project**, give it a name (e.g., `bookit`), choose a region, and set a database password.
- Wait for the project to finish provisioning.

**2. Run the schema.**

- In your Supabase project dashboard, navigate to **SQL Editor**.
- Open `lib/db/schema.sql` from this repository and paste the contents into the editor.
- Click **Run** to create all six tables: `categories`, `users`, `services`, `time_slots`, `bookings`, and `reviews`.

**3. (Optional) Seed the categories table.**

In the Supabase SQL Editor, run:

```sql
INSERT INTO categories (name, icon_emoji) VALUES
  ('Hair Styling',     '✂️'),
  ('Lawn Care',        '🌿'),
  ('Graphic Design',   '🎨'),
  ('Tutoring',         '📚'),
  ('Home Repair',      '🔨'),
  ('Cleaning',         '🧹'),
  ('Fitness Training', '💪'),
  ('Photography',      '📷'),
  ('Consulting',       '💼');
```

**4. Copy your Supabase credentials.**

In your Supabase project dashboard, go to **Project Settings → API** and copy your Project URL and anon/public key for your `.env.local` file.

---

### Running the Application

**1. Clone the repository and install dependencies.**

```bash
git clone <your-repo-url>
cd book-it
npm install
```

**2. Create your `.env.local` file** (see [Environment Configuration](#environment-configuration) below).

**3. Start the development server.**

```bash
npm run dev
```

The application will start on **http://localhost:3000**.

**4. To build for production:**

```bash
npm run build
npm start
```

> **Deployment:** The application is deployed to **Vercel**. Push to the `main` branch to trigger an automatic deployment. Ensure all environment variables are configured in the Vercel project dashboard.

---

## Environment Configuration

Create a file named `.env.local` in the root of the project. This file is listed in `.gitignore` and must **never** be committed to the repository.

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Session
SESSION_SECRET=replace_this_with_a_long_random_secret_string
SESSION_MAX_AGE=86400000

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL (found in Project Settings → API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anon key — safe to expose client-side |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key — **server-side only, never expose client-side** |
| `SESSION_SECRET` | A long, random string used to sign session cookies — keep this secret |
| `SESSION_MAX_AGE` | Session lifetime in milliseconds (86400000 = 24 hours) |
| `NEXT_PUBLIC_BASE_URL` | Base URL of the app (change to your Vercel URL in production) |

> **Important:** Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never prefix `SUPABASE_SERVICE_ROLE_KEY` with `NEXT_PUBLIC_`.

---

## Database Schema Overview

The application uses six relational tables hosted on Supabase (PostgreSQL).

| Table | Description |
|---|---|
| `categories` | Lookup table for the 9 predefined service categories |
| `users` | All registered users; `role` field distinguishes `customer` from `provider` |
| `services` | Service listings created by providers, linked to a category |
| `time_slots` | Specific date/time windows for a service; `is_booked` flag tracks availability |
| `bookings` | Confirmed appointments linking a customer, service, and time slot |
| `reviews` | Post-service ratings (1–5 stars) and comments, one per completed booking |

**Key Relationships:**

| From | To | Relationship |
|---|---|---|
| users (provider) | services | One provider has many services |
| services | time_slots | One service has many time slots |
| users (customer) | bookings | One customer has many bookings |
| time_slots | bookings | One booking links to one time slot (UNIQUE) |
| bookings | reviews | One completed booking has one review (UNIQUE) |
| categories | services | One category contains many services |

The full `CREATE TABLE` SQL is located at `lib/db/schema.sql`.

---

## API Routes Overview

All API endpoints live under `src/api/` and are accessed at `/api/...`. Responses are in JSON format.

### Authentication — `/api/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new customer or provider |
| `POST` | `/api/auth/login` | Public | Log in and create a session |
| `POST` | `/api/auth/logout` | Authenticated | Destroy the session and log out |

### Services — `/api/services`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/services` | Public | List all services (optional `?category=` or `?q=` filters) |
| `GET` | `/api/services/:id` | Public | Get a single service with its provider and reviews |
| `POST` | `/api/services` | Provider only | Create a new service listing |
| `PUT` | `/api/services/:id` | Provider (owner) | Update an existing service listing |
| `DELETE` | `/api/services/:id` | Provider (owner) | Delete a service and cascade to its time slots |

### Time Slots — `/api/timeslots`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/timeslots/:serviceId` | Public | Get all available slots for a service (optional `?date=`) |
| `POST` | `/api/timeslots` | Provider only | Add a new available time slot |
| `DELETE` | `/api/timeslots/:id` | Provider (owner) | Remove a specific time slot by its ID |

### Bookings — `/api/bookings`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/bookings/customer` | Customer only | Get all bookings for the logged-in customer |
| `GET` | `/api/bookings/provider` | Provider only | Get all bookings for the logged-in provider's services |
| `POST` | `/api/bookings` | Customer only | Create a new booking for a time slot |
| `PATCH` | `/api/bookings/:id/cancel` | Customer (owner) | Cancel an upcoming booking |
| `PATCH` | `/api/bookings/:id/status` | Provider only | Update booking status (confirmed/completed/cancelled) |

### Reviews — `/api/reviews`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/reviews/:serviceId` | Public | Get all reviews for a service |
| `POST` | `/api/reviews` | Customer only | Submit a review for a completed booking |

---

## Security Practices

- **SQL Injection Prevention:** All database interactions go through the Supabase client, which uses parameterized queries internally. Raw string concatenation with user input is never used.
- **XSS Prevention:** React's JSX escapes output by default. `dangerouslySetInnerHTML` is never used with user-generated content.
- **Session Security:** Cookies are configured with `httpOnly: true`, `sameSite: 'strict'`, and `secure: true` in production.
- **Environment Variable Separation:** The Supabase service role key is kept strictly server-side. Only the public anon key is used in client-side code.
- **Authorization Checks:** Every protected API route verifies the authenticated user's role and ownership before performing any operation.
- **Input Validation:** All inputs are validated both client-side (for immediate feedback) and server-side (for security).

---

## Testing

Test cases and results are documented in `tests/test-plan.md`. The full testing summary report is in `docs/milestone-03/`.

**Run automated tests:**

```bash
npm test
```

**Manual testing covers:**

| Area | Example Test Cases |
|---|---|
| Authentication | Register with valid data, register duplicate email, login with wrong password |
| Service CRUD | Create service with missing fields, edit another provider's service (expect 403) |
| Booking | Book an available slot, attempt to book an already-booked slot (expect error) |
| Cancellation | Cancel an upcoming booking, attempt to cancel a past booking (expect error) |
| Validation | Submit forms with empty required fields, negative price, past date for time slot |
| Security | SQL injection attempt in login field, XSS payload in service description |

---

## Project Management

- **GitHub Kanban Board:** [https://github.com/users/JeffVu-1/projects/3](https://github.com/users/JeffVu-1/projects/3)
- **Activity Blog / Wiki:** [https://github.com/JeffVu-1/CP476/wiki](https://github.com/JeffVu-1/CP476/wiki)

---

## License

This project was developed as part of the CP476B – Internet Computing course at Wilfrid Laurier University (WLU), Spring 2026. It is intended solely for academic evaluation purposes.

---

*Book It. — Making service discovery and booking simpler for everyone.*
