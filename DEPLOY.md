# TutorLK — Step-by-Step Deployment Guide

## Step 1: Create Supabase project (5 minutes)

1. Go to https://supabase.com → Sign up free
2. Click "New project"
   - Name: tutorlk
   - Database password: (save this)
   - Region: Southeast Asia (Singapore) — closest to Sri Lanka
3. Wait ~2 minutes for project to spin up
4. Go to Settings > Database:
   - Copy "Connection string" (Transaction mode) → this is DATABASE_URL
   - Copy "Connection string" (Session mode) → this is DIRECT_URL
5. Go to Settings > API:
   - Copy "Project URL" → NEXT_PUBLIC_SUPABASE_URL
   - Copy "anon public" key → NEXT_PUBLIC_SUPABASE_ANON_KEY
   - Copy "service_role" key → SUPABASE_SERVICE_ROLE_KEY

## Step 2: Set up Google OAuth (10 minutes)

1. Go to https://console.cloud.google.com
2. New project → name it "TutorLK"
3. APIs & Services > Credentials > Create OAuth 2.0 Client ID
   - Application type: Web application
   - Authorized redirect URIs:
     - http://localhost:3000/api/auth/callback/google
     - https://tutorlk.lk/api/auth/callback/google
4. Copy Client ID → GOOGLE_CLIENT_ID
5. Copy Client Secret → GOOGLE_CLIENT_SECRET

## Step 3: Set up PayHere (10 minutes)

1. Go to https://www.payhere.lk → Register as merchant
2. Once approved, go to Settings > Integrations
3. Copy Merchant ID → NEXT_PUBLIC_PAYHERE_MERCHANT_ID
4. Copy Merchant Secret → PAYHERE_SECRET
5. For testing: use sandbox.payhere.lk and set NEXT_PUBLIC_PAYHERE_ENV=sandbox

## Step 4: Set up Resend (5 minutes)

1. Go to https://resend.com → Sign up free
2. Add your domain (tutorlk.lk) and verify DNS
3. API Keys > Create API key
4. Copy key → RESEND_API_KEY

## Step 5: Generate NEXTAUTH_SECRET

Run this command in your terminal:
openssl rand -base64 32
Copy the output → NEXTAUTH_SECRET

## Step 6: Fill .env.local

cp .env.example .env.local
# Open .env.local and fill in ALL values from steps 1-5

## Step 7: Push database schema

npm run db:push
# This creates all tables in your Supabase database

npm run db:seed
# This adds Sri Lankan districts, cities, subjects and demo accounts

## Step 8: Test locally

npm run dev
# Open http://localhost:3000
# Test: register as student, find tutors, make a booking

## Step 9: Push to GitHub

git init
git add .
git commit -m "feat: initial TutorLK project"

# Go to github.com → New repository → name it tutorlk
git remote add origin https://github.com/YOUR_USERNAME/tutorlk.git
git push -u origin main

## Step 10: Deploy to Vercel

1. Go to https://vercel.com → Sign up with GitHub
2. Click "Add New > Project"
3. Import your tutorlk repository
4. Framework Preset: Next.js (auto-detected)
5. Click "Environment Variables" and add ALL variables from .env.local:
   DATABASE_URL
   DIRECT_URL
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   NEXTAUTH_URL → set to https://tutorlk.lk (or your Vercel URL for now)
   NEXTAUTH_SECRET
   GOOGLE_CLIENT_ID
   GOOGLE_CLIENT_SECRET
   RESEND_API_KEY
   FROM_EMAIL
   NEXT_PUBLIC_PAYHERE_MERCHANT_ID
   PAYHERE_SECRET
   NEXT_PUBLIC_PAYHERE_ENV
   NEXT_PUBLIC_APP_URL → https://tutorlk.lk
6. Click "Deploy"
7. Wait ~60 seconds → your site is live at yourproject.vercel.app

## Step 11: Connect domain tutorlk.lk

1. Register domain at https://www.nic.lk (official .lk registrar)
   Cost: ~LKR 3,000/year
2. Go to https://cloudflare.com → Add site → enter tutorlk.lk
   Select Free plan
3. Cloudflare gives you 2 nameservers (e.g. ns1.cloudflare.com)
4. At nic.lk → update nameservers to Cloudflare's nameservers
   (Takes 24-48 hours to propagate)
5. In Vercel: Project Settings > Domains > Add Domain > tutorlk.lk
6. Vercel shows you a CNAME record to add
7. In Cloudflare: DNS > Add Record:
   Type: CNAME
   Name: @ (or www)
   Target: cname.vercel-dns.com
8. SSL certificate auto-provisions within minutes

## Step 12: Verify everything works

Open https://tutorlk.lk and test:
- Homepage loads fast
- Register as student works
- Google login works
- Tutor search works
- Book a session works (sandbox payment)
- Student dashboard shows correctly

## DONE! Your site is live.

---

## Auto-deploy (every git push)

After Vercel is connected, every push to main branch automatically deploys:
git add .
git commit -m "your changes"
git push
# → live in ~45 seconds at tutorlk.lk

## Monthly costs at launch

Vercel hosting:       $0 (free tier)
Supabase database:    $0 (free tier — 500MB)
Cloudflare CDN:       $0 (free forever)
Resend email:         $0 (3,000 emails/month free)
Domain tutorlk.lk:   ~LKR 3,000/year
PayHere payments:     1.5-2.5% per transaction only

TOTAL: ~LKR 3,000/year to run
