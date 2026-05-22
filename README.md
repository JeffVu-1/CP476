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
   - [Running the Back-End](#running-the-back-end)
   - [Running the Front-End](#running-the-front-end)
7. [Environment Configuration](#environment-configuration)
8. [Database Schema Overview](#database-schema-overview)
9. [API Routes Overview](#api-routes-overview)
10. [Security Practices](#security-practices)
11. [Testing](#testing)
12. [Project Management](#project-management)
13. [Milestones](#milestones)
14. [Contributing](#contributing)
15. [License](#license)

---

## Project Overview

**Book It.** is a full-stack web application that acts as a central hub connecting customers with local and online service providers. The platform allows service providers to list their services, manage availability, and receive bookings, while customers can discover services by browsing predefined categories or by describing their problem in plain language.

**Core Goals:**
- Make booking local services easier, faster, and more flexible for both customers and providers.
- Eliminate the need for customers to visit multiple websites or rely on word-of-mouth to find trusted providers.
- Give service providers a lightweight, unified dashboard to manage listings, time slots, and bookings.

**Two Discovery Modes:**
1. **Category Browsing** — Explore services organized into categories such as Hair Styling, Lawn Care, Graphic Design, Tutoring, Home Repair, Cleaning, Fitness Training, Photography, and Consulting.
2. **Natural-Language Search** — Describe a problem (e.g., *"My lawn is very dry and I want to make it look better"*) and receive relevant service suggestions via keyword matching.

---

## Features

### Must Have (Implemented)
- User registration and login for customers and service providers (role-based)
- Service listing management — Create, Read, Update, Delete (CRUD) by providers
- Category-based service browsing
- Service detail page (description, category, price, duration, delivery mode, provider info)
- Time-slot availability management by providers
- Appointment booking by customers (create, view, cancel)
- Provider dashboard — view and manage all incoming bookings
- Customer dashboard — view upcoming and past bookings
- Server-side input validation on all forms and endpoints
- Secure password hashing with bcrypt
- SQL injection prevention via parameterized prepared statements

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
| Front-End | HTML5, CSS3, JavaScript (Vanilla ES6+) |
| Back-End | Node.js, Express.js |
| Database | MySQL / MariaDB |
| Version Control | Git, GitHub |
| Project Management | GitHub Projects (Kanban) |
| Documentation | GitHub Wiki (Markdown) |
| Password Hashing | bcrypt (via bcryptjs) |
| Session Management | express-session |
| DB Driver | mysql2 |

> **Note:** No external CSS frameworks (e.g., Bootstrap), UI libraries, or unapproved third-party dependencies are used. All code relies exclusively on course-covered technologies as required by CP476B.

---

## Team Members

| Name | Student ID | Role |
|---|---|---|
| [Member 1] | [ID] | Project Manager |
| [Member 2] | [ID] | Front-End Lead |
| [Member 3] | [ID] | Front-End Developer |
| [Member 4] | [ID] | Front-End Developer |
| [Member 5] | [ID] | Back-End Lead |
| [Member 6] | [ID] | Back-End Developer |
| [Member 7] | [ID] | Back-End Developer |
| [Member 8] | [ID] | Database Architect |
| [Member 9] | [ID] | Security & Testing Lead |
| [Member 10] | [ID] | Documentation Lead |

---

## Repository Structure

```
book-it/
├── README.md                        ← This file
├── links.txt                        ← GitHub repo, Kanban board, and Wiki URLs
├── .gitignore
│
├── docs/
│   ├── milestone-01/                ← M1 proposal, wireframes, user stories
│   ├── milestone-02/                ← M2 ER diagram, SQL schema, front-end screenshots
│   └── milestone-03/                ← M3 testing report, demo video link, slides
│
├── frontend/
│   ├── index.html                   ← Homepage (category grid + search bar)
│   ├── css/
│   │   └── style.css                ← Global stylesheet
│   ├── js/
│   │   ├── main.js                  ← Shared utilities and DOM helpers
│   │   ├── auth.js                  ← Login / registration form logic
│   │   ├── services.js              ← Service listing and search logic
│   │   ├── booking.js               ← Booking form, slot fetching, confirmation
│   │   ├── dashboard-customer.js    ← Customer dashboard interactions
│   │   └── dashboard-provider.js   ← Provider dashboard interactions
│   └── pages/
│       ├── login.html
│       ├── register.html
│       ├── services.html            ← Category / search results listing
│       ├── service-detail.html      ← Individual service detail + reviews
│       ├── book.html                ← Booking form (date + slot picker)
│       ├── booking-confirmation.html
│       ├── dashboard-customer.html
│       ├── dashboard-provider.html
│       ├── create-service.html
│       ├── edit-service.html
│       └── manage-availability.html
│
├── backend/
│   ├── server.js                    ← Express entry point
│   ├── package.json
│   ├── package-lock.json
│   │
│   ├── routes/
│   │   ├── auth.js                  ← POST /api/auth/register, /login, /logout
│   │   ├── services.js              ← GET/POST/PUT/DELETE /api/services
│   │   ├── timeslots.js             ← GET/POST/DELETE /api/timeslots
│   │   ├── bookings.js              ← GET/POST/PATCH /api/bookings
│   │   └── reviews.js               ← GET/POST /api/reviews
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── serviceController.js
│   │   ├── timeslotController.js
│   │   ├── bookingController.js
│   │   └── reviewController.js
│   │
│   ├── middleware/
│   │   ├── auth.js                  ← Session authentication guard
│   │   └── roleCheck.js             ← Role-based access (customer vs provider)
│   │
│   └── db/
│       ├── connection.js            ← MySQL connection pool (mysql2)
│       └── schema.sql               ← All CREATE TABLE statements
│
└── tests/
    ├── auth.test.js
    ├── services.test.js
    ├── bookings.test.js
    └── test-plan.md                 ← Manual test cases and results
```

---

## Getting Started

### Prerequisites

Ensure the following are installed on your machine before proceeding:

- **Node.js** v18 or higher — [https://nodejs.org](https://nodejs.org)
- **npm** v9 or higher (included with Node.js)
- **MySQL** v8 or **MariaDB** v10.6+ — [https://dev.mysql.com/downloads](https://dev.mysql.com/downloads)
- **Git** — [https://git-scm.com](https://git-scm.com)

Verify installations:

```bash
node --version
npm --version
mysql --version
git --version
```

---

### Database Setup

**1. Start your MySQL server.**

```bash
# macOS (Homebrew)
brew services start mysql

# Windows — start via MySQL Workbench or Services panel

# Linux
sudo systemctl start mysql
```

**2. Log into MySQL as root.**

```bash
mysql -u root -p
```

**3. Create the database and a dedicated user.**

```sql
CREATE DATABASE bookit;
CREATE USER 'bookit_user'@'localhost' IDENTIFIED BY 'your_password_here';
GRANT ALL PRIVILEGES ON bookit.* TO 'bookit_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**4. Run the schema file to create all tables.**

```bash
mysql -u bookit_user -p bookit < backend/db/schema.sql
```

This creates all six tables: `categories`, `users`, `services`, `time_slots`, `bookings`, and `reviews`, with all primary keys, foreign keys, and constraints.

**5. (Optional) Seed the categories table.**

```sql
USE bookit;

INSERT INTO categories (name, icon_emoji) VALUES
  ('Hair Styling',    '✂️'),
  ('Lawn Care',       '🌿'),
  ('Graphic Design',  '🎨'),
  ('Tutoring',        '📚'),
  ('Home Repair',     '🔨'),
  ('Cleaning',        '🧹'),
  ('Fitness Training','💪'),
  ('Photography',     '📷'),
  ('Consulting',      '💼');
```

---

### Running the Back-End

**1. Navigate to the backend directory.**

```bash
cd backend
```

**2. Install dependencies.**

```bash
npm install
```

**3. Create your environment configuration file** (see [Environment Configuration](#environment-configuration) below).

**4. Start the server.**

```bash
# Development (with auto-restart on file changes)
npm run dev

# Production
npm start
```

The server will start on **http://localhost:3000** by default (or the port set in your `.env` file).

You should see:

```
[Book It.] Server running on http://localhost:3000
[Book It.] Connected to MySQL database: bookit
```

---

### Running the Front-End

The front-end is plain HTML/CSS/JavaScript served as static files directly by Express. No separate build step is required.

Once the back-end server is running, open your browser and navigate to:

```
http://localhost:3000
```

The Express server is configured to serve all files from the `frontend/` directory.

> **Note:** Do not open the HTML files directly by double-clicking them in your file system (i.e., via `file://` protocol). The front-end makes `fetch()` API calls to the back-end, which require the server to be running. Always access the app through `http://localhost:3000`.

---

## Environment Configuration

Create a file named `.env` in the `backend/` directory with the following contents. This file is listed in `.gitignore` and must **never** be committed to the repository.

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=bookit
DB_USER=bookit_user
DB_PASSWORD=your_password_here

# Session
SESSION_SECRET=replace_this_with_a_long_random_secret_string
SESSION_MAX_AGE=86400000
```

| Variable | Description |
|---|---|
| `PORT` | Port the Express server listens on (default: 3000) |
| `DB_HOST` | MySQL host (typically `localhost` for local development) |
| `DB_PORT` | MySQL port (default: 3306) |
| `DB_NAME` | Name of the database created during setup |
| `DB_USER` | MySQL username created for this project |
| `DB_PASSWORD` | Password for the MySQL user |
| `SESSION_SECRET` | A long, random string used to sign the session cookie — keep this secret |
| `SESSION_MAX_AGE` | Session lifetime in milliseconds (86400000 = 24 hours) |

---

## Database Schema Overview

The application uses six relational tables. All foreign keys are enforced with `ON DELETE CASCADE` where appropriate.

| Table | Description |
|---|---|
| `categories` | Lookup table for the 9 predefined service categories |
| `users` | All registered users; `role` field distinguishes `customer` from `provider` |
| `services` | Service listings created by providers, linked to a category |
| `time_slots` | Specific date/time windows for a service; `is_booked` flag tracks availability |
| `bookings` | Confirmed appointments linking a customer, service, and time slot |
| `reviews` | Post-service ratings (1–5 stars) and comments, one per completed booking |

**Key Relationships:**

```
users (provider) ──< services ──< time_slots
                                       │
users (customer) ──< bookings >────────┘
                        │
                     reviews (one per booking)
```

The full `CREATE TABLE` SQL is located at `backend/db/schema.sql`.

---

## API Routes Overview

All API endpoints are prefixed with `/api`. Responses are in JSON format.

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
| `DELETE` | `/api/timeslots/:id` | Provider (owner) | Remove an available time slot |

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

The following security measures are implemented throughout the application, consistent with CP476B course material:

- **Password Hashing:** All passwords are hashed using `bcryptjs` with a salt round of 12 before being stored. Plain-text passwords are never saved to the database.

- **SQL Injection Prevention:** All database queries use parameterized prepared statements via the `mysql2` driver. Raw string concatenation with user input is never used in any query.

- **XSS Prevention:** All user-supplied content is escaped before being inserted into the DOM. `textContent` is used instead of `innerHTML` when injecting user data on the client side. The `htmlspecialchars` equivalent is applied when echoing user data into HTML on the server side.

- **Session Security:** Sessions are managed server-side using `express-session`. Cookies are configured with `httpOnly: true` (prevents JavaScript access), `sameSite: 'strict'` (prevents CSRF), and `secure: true` in production (HTTPS only).

- **Authorization Checks:** Every protected endpoint verifies the authenticated user's role and ownership before performing any operation. A provider cannot modify another provider's service listing; a customer cannot cancel another customer's booking.

- **Input Validation:** All form inputs are validated on both the client side (JavaScript, for immediate feedback) and the server side (Express route handlers, for security). Client-side validation alone is never considered sufficient.

---

## Testing

Test cases and results are documented in `tests/test-plan.md` and the full testing summary report is in `docs/milestone-03/`.

**To run automated tests** (if configured):

```bash
cd backend
npm test
```

**Manual testing** covers the following areas:

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

- **GitHub Kanban Board:** [Insert GitHub Projects URL here]
- **Activity Blog / Wiki:** [Insert GitHub Wiki URL here]

The Kanban board maintains five columns throughout development:

```
Backlog → Ready → In Progress → In Review → Done
```

All team members are responsible for moving their own cards and keeping the board current. Individual contribution is assessed via commit history quality and Kanban card activity.

---

## Milestones

| Milestone | Focus | Weight | Due |
|---|---|---|---|
| **M1** | Project Planning and Design | 5% | As per MyLS announcement |
| **M2** | Front-End Implementation and Database Design | 7% | As per MyLS announcement |
| **M3** | Full-Stack Integration, Testing, and Demo | 8% | As per MyLS announcement |

Each milestone is submitted as a ZIP file to the corresponding MyLS Dropbox folder, containing all required PDFs, this README, and a `links.txt` file with the GitHub repository URL, Kanban board URL, and Wiki/docs URL.

---

## Contributing

All contributions must be made through GitHub. The following workflow applies to all team members:

1. **Assign yourself** to a Kanban card in the *Ready* column before starting work.
2. **Create a branch** for your feature or fix using the naming convention: `feature/story-id-short-description` (e.g., `feature/AUTH-1-customer-registration`).
3. **Commit frequently** with clear, descriptive messages (e.g., `AUTH-1: Add registration form validation and POST route`).
4. **Open a Pull Request** when the feature is complete and move the Kanban card to *In Review*.
5. **Request a review** from at least one team member before merging.
6. **Merge to `main`** only after the review is approved and all acceptance criteria are confirmed.
7. **Move the Kanban card** to *Done* after the merge.

> Individual grades may be adjusted based on GitHub commit history, Kanban card activity, and Wiki documentation. Ensure your contributions are visible and consistent throughout all three milestones.

---

## License

This project was developed as part of the CP476B – Internet Computing course at [University Name], Spring 2026. It is intended solely for academic evaluation purposes.

---

*Book It. — Making service discovery and booking simpler for everyone.*
