# NEXWAVE Landing Page

A cinematic Next.js landing page for NEXWAVE with the uploaded logo, brand-led storytelling, animated sections, OTP registration, duplicate prevention and member export.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Without `RESEND_API_KEY`, verification codes are returned as `demoCode` for local testing. In production, set the variables from `.env.example`.

## Production Setup

Create a Supabase table named `members`:

```sql
create table members (
  email text primary key,
  full_name text not null,
  instagram text not null,
  creative_field text not null,
  verified boolean default false,
  verified_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `EMAIL_FROM` and `ADMIN_EXPORT_TOKEN` on Vercel.

Export verified and pending members as CSV:

```txt
/api/admin/export?token=YOUR_ADMIN_EXPORT_TOKEN
```

After a member verifies their OTP, the app sends a welcome email and adds the member to Resend Contacts for future Broadcast emails.
