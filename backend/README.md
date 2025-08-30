# Roadside Assistance Backend

Tech: Node.js, Express, MySQL (mysql2), JWT

Twilio/OTP is reserved for future implementation. Current auth is simple Sign Up / Sign In.

## Requirements
- MySQL 8 running locally
- Node.js 18+

## Setup
1. Copy `.env.example` to `.env` and adjust values:
   - `DATABASE_URL` e.g. `mysql://Root:root@localhost:3306/roadside_assist`
   - `JWT_SECRET` any long random string
   - Optionally set Twilio vars for future use
2. Install deps:
   - `npm i`
3. Initialize database (creates DB and tables):
   - `npm run db:init`
4. Seed sample data (Bengaluru-area workshops and an admin user):
   - `npm run db:seed`
5. Start dev server:
   - `npm run dev`

## API
- `POST /api/auth/signup` { phone, name?, password } -> { token, user }
- `POST /api/auth/signin` { phone, password } -> { token, user }
- `GET /api/workshops?lat=&lng=&radiusKm=&service=` -> list workshops (distance filtered/sorted if coords provided)
- `GET /api/workshops/:id` -> workshop details

Notes:
- Services are stored as JSON array in MySQL. The API returns `services` as an array.
- Distance is added as `distanceKm` when `lat`, `lng` and `radiusKm` are provided.
