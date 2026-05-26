# TutorLK 🎓

Sri Lanka's tutor marketplace — Next.js 14, Supabase, Prisma, PayHere.

---

## Quick start (local development)

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment
```bash
cp .env.example .env.local
# Fill in your Supabase, NextAuth, and PayHere values
```

### 3. Set up database
```bash
npx prisma db push        # Create tables in Supabase
npx prisma db seed        # Seed provinces, districts, subjects, demo users
```

### 4. Run locally
```bash
npm run dev
# Open http://localhost:3000
```

**Demo accounts:**
- Student: `ayesha@demo.com` / `student123`
- Tutor: `nuwan@demo.com` / `tutor123`

---

## Deploy to Vercel (free)

### Step 1 — Create Supabase project
1. Go to [supabase.com](https://supabase.com) → New project
2. Copy: Project URL, Anon key, Service role key, Database password
3. Go to Project Settings → Database → copy Connection string (Transaction mode)

### Step 2 — Push to GitHub
```bash
git init
git add .
git commit -m "feat: initial TutorLK setup"
git remote add origin https://github.com/YOUR_USERNAME/tutorlk.git
git push -u origin main
```

### Step 3 — Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) → Import Git Repository → select `tutorlk`
2. Add environment variables (from your .env.local):
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   DATABASE_URL
   DIRECT_URL
   NEXTAUTH_URL          ← set to https://tutorlk.lk (your domain)
   NEXTAUTH_SECRET       ← run: openssl rand -base64 32
   GOOGLE_CLIENT_ID      (optional)
   GOOGLE_CLIENT_SECRET  (optional)
   RESEND_API_KEY
   PAYHERE_MERCHANT_ID
   PAYHERE_SECRET
   NEXT_PUBLIC_PAYHERE_SANDBOX=true
   ```
3. Click Deploy — live in ~2 minutes

### Step 4 — Run migrations on production
After first deploy, in Vercel dashboard → Functions → run:
```bash
npx prisma db push
npx prisma db seed
```

Or use Vercel CLI:
```bash
npx vercel env pull .env.production
DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d= -f2) npx prisma db push
```

### Step 5 — Connect your domain
1. Register `tutorlk.lk` at [nic.lk](https://nic.lk)
2. Add site to [cloudflare.com](https://cloudflare.com) → copy nameservers
3. Update nameservers at nic.lk
4. In Vercel: Settings → Domains → Add `tutorlk.lk`
5. In Cloudflare: Add CNAME → `cname.vercel-dns.com`
6. SSL provisions automatically

---

## Project structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/          NextAuth + register
│   │   ├── tutors/        Search + single tutor
│   │   ├── bookings/      Create + list bookings
│   │   ├── messages/      Chat messages
│   │   ├── conversations/ Conversation list
│   │   └── payments/      PayHere webhook
│   ├── tutors/            Search page + district SEO pages
│   ├── book/[tutorId]/    Booking flow
│   ├── student/           Student dashboard + papers
│   ├── tutor/             Tutor dashboard + setup
│   ├── messages/          Chat UI
│   ├── login/             Auth pages
│   ├── register/
│   └── how-it-works/
├── components/
│   ├── ui/               Button, Badge, Input, Avatar, Stars
│   ├── layout/           Navbar, Footer
│   └── tutors/           TutorCard, TutorSearch
├── lib/
│   ├── prisma.ts         DB client
│   ├── auth.ts           NextAuth config
│   ├── supabase/         Browser + server clients
│   └── utils.ts          Helpers
└── types/                TypeScript types
prisma/
├── schema.prisma         Full DB schema (18 models)
└── seed.ts               All provinces, districts, cities, subjects + demo data
```

---

## Tech stack

| Layer        | Technology                    | Cost    |
|--------------|-------------------------------|---------|
| Framework    | Next.js 14 (App Router)       | Free    |
| Styling      | Tailwind CSS                  | Free    |
| Database     | Supabase PostgreSQL            | Free    |
| ORM          | Prisma                        | Free    |
| Auth         | NextAuth.js v4                | Free    |
| Hosting      | Vercel                        | Free    |
| CDN + DNS    | Cloudflare                    | Free    |
| Email        | Resend                        | Free    |
| Payments     | PayHere (Sri Lanka)           | 1.5-2.5%|
| Domain       | tutorlk.lk via nic.lk         | ~LKR 3,000/yr |

**Total monthly cost at launch: LKR 0** (domain is annual)
