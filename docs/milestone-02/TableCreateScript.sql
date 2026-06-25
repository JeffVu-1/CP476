-- ENUM types first
CREATE TYPE user_role        AS ENUM ('customer', 'provider');
CREATE TYPE delivery_mode    AS ENUM ('in-person', 'online');
CREATE TYPE booking_status   AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');

-- 1. categories
CREATE TABLE categories (
    id          SERIAL        PRIMARY KEY,
    name        VARCHAR(100)  NOT NULL UNIQUE,
    icon_emoji  VARCHAR(10)
);

-- 2. users
CREATE TABLE users (
    id             SERIAL       PRIMARY KEY,
    full_name      VARCHAR(100) NOT NULL,
    email          VARCHAR(255) NOT NULL UNIQUE,
    password_hash  VARCHAR(255) NOT NULL,
    role           user_role    NOT NULL,
    business_name  VARCHAR(150),
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- 3. services
CREATE TABLE services (
    id                SERIAL          PRIMARY KEY,
    provider_id       INT             NOT NULL REFERENCES users(id)       ON DELETE CASCADE,
    category_id       INT             NOT NULL REFERENCES categories(id)  ON DELETE RESTRICT,
    title             VARCHAR(150)    NOT NULL,
    description       TEXT,
    price             DECIMAL(10, 2)  NOT NULL,
    duration_minutes  INT             NOT NULL,
    delivery_mode     delivery_mode   NOT NULL,
    created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- 4. time_slots
CREATE TABLE time_slots (
    id          SERIAL   PRIMARY KEY,
    service_id  INT      NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    slot_date   DATE     NOT NULL,
    start_time  TIME     NOT NULL,
    is_booked   BOOLEAN  NOT NULL DEFAULT FALSE
);

-- 5. bookings
CREATE TABLE bookings (
    id            SERIAL          PRIMARY KEY,
    customer_id   INT             NOT NULL REFERENCES users(id)       ON DELETE CASCADE,
    service_id    INT             NOT NULL REFERENCES services(id)    ON DELETE CASCADE,
    time_slot_id  INT             NOT NULL UNIQUE REFERENCES time_slots(id) ON DELETE CASCADE,
    status        booking_status  NOT NULL DEFAULT 'pending',
    created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- 6. reviews
CREATE TABLE reviews (
    id           SERIAL       PRIMARY KEY,
    booking_id   INT          NOT NULL UNIQUE REFERENCES bookings(id)  ON DELETE CASCADE,
    customer_id  INT          NOT NULL REFERENCES users(id)            ON DELETE CASCADE,
    service_id   INT          NOT NULL REFERENCES services(id)         ON DELETE CASCADE,
    rating       INT          NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment      TEXT,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);