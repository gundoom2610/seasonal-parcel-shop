# Vercel Environment Variables Setup

## Required Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://cmcdylnodynsedyyqixi.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Production, Preview, Development |

## Steps

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable with the values from your `.env` file
5. Make sure to select all environments (Production, Preview, Development)
6. Click **Save**
7. **Redeploy** your project for changes to take effect

## Security Notes

- The `VITE_SUPABASE_ANON_KEY` is a **public key** - safe to expose in client-side code
- Your data is protected by **Row Level Security (RLS)** policies in Supabase
- Never expose your `SUPABASE_SERVICE_ROLE_KEY` (admin key) - that should only be used server-side
