# ProofDesk — API

Backend for ProofDesk, a testimonial-collection and review tool. Customers submit testimonials (written, video or social); reviewers approve or reject them individually or in bulk; approved ones are published to a public testimonials feed.

**Stack:** Node.js · Express · TypeScript · MongoDB (Mongoose) · Zod · express-rate-limit · Helmet · Vitest · Vercel

Frontend: [proofdesk-frontend](https://github.com/Arpitpatidar00/proofdesk-frontend)

## API

| Method | Route | Role | Purpose |
| :-- | :-- | :-- | :-- |
| `GET` | `/api/health` | — | Health check |
| `POST` | `/api/submissions` | any | Submit a testimonial |
| `GET` | `/api/submissions` | reviewer | Review queue — search, filter, sort (newest / oldest / rating), paginate |
| `GET` | `/api/submissions/count`, `/api/submissions/:id` | reviewer | Counts and detail |
| `PATCH` | `/api/submissions/:id/action` | reviewer | Approve or reject one |
| `POST` | `/api/submissions/bulk-action` | reviewer | Approve or reject many |
| `GET` | `/api/testimonials` | — | Public feed of approved testimonials |
| `GET` | `/api/notifications` | reviewer | Review notifications |

Roles come from the `x-user-role` header (defaults to viewer) — a deliberate stand-in for real auth in this project.

## Design

- **Layered modules:** routes → controller → service → repository, one folder per module (`submissions`, `notifications`).
- **Query builder** turns validated query params into Mongo filters, sort and pagination.
- **Consistent responses and errors** via shared `response` and `errors` helpers and one error-handling middleware.
- **Rate limiting** on every `/api` route.

## Run locally

```bash
cp .env.example .env   # MONGODB_URI, PORT, CORS_ORIGIN
npm install
npm run db:seed        # optional sample data
npm run dev
npm test
```
