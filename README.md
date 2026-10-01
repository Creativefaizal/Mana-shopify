# Mana

A storefront built with Next.js 16, Supabase (database and Google sign-in), and Mailgun (order confirmation emails).

The app runs without any keys. Products come from `data/catalog.json`, orders are created in demo mode, and emails are printed to the server console. To make it real, add your keys in the steps below.

```bash
npm install
npm run dev        # http://localhost:3000
```

---

## 1. Supabase (database)

1. Go to https://supabase.com/dashboard and choose **New project**. Pick a name such as `mana`, set a database password, and choose a region.
2. When the project is ready, open **Project Settings → API** (or **API Keys**). Copy these into `.env.local`:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / publishable key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role / secret key** → `SUPABASE_SERVICE_ROLE_KEY` (server only, never share it)
3. Open **SQL Editor → New query**, paste the whole of `supabase/schema.sql`, and click **Run**.
4. Seed the products:
   ```bash
   npm run seed
   ```
5. Restart `npm run dev`. Orders now show up in **Table Editor → orders / order_items**.

## 2. Google sign-in (Google Cloud Console + Supabase)

1. Go to https://console.cloud.google.com and create a project (or pick an existing one).
2. Open **APIs & Services → OAuth consent screen** (shown as "Google Auth Platform" on newer consoles).
   - User type: **External**. App name: **Mana**. Enter your support email and your developer contact email.
   - Scopes: `openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile`.
   - While the app is in **Testing**, add your own Gmail under **Test users**, or click **Publish app**.
3. Open **APIs & Services → Credentials → Create credentials → OAuth client ID**.
   - Application type: **Web application**.
   - **Authorized JavaScript origins**: `http://localhost:3000` (add your production domain later).
   - **Authorized redirect URIs**: `https://<your-project-ref>.supabase.co/auth/v1/callback`
     (Supabase shows the exact URL in step 4).
   - Click **Create** and copy the **Client ID** and **Client secret**.
4. In Supabase, open **Authentication → Sign In / Providers → Google**. Turn it on, paste the Client ID and Client secret, and save.
5. In Supabase, open **Authentication → URL Configuration**:
   - **Site URL**: `http://localhost:3000`
   - **Redirect URLs**: add `http://localhost:3000/auth/callback` (and `https://your-domain.com/auth/callback` later).
6. Restart the dev server. **Sign in → Continue with Google** now works, and each new user gets a row in `profiles`.

The Google client secret goes in Supabase, not in `.env.local`.

## 3. Mailgun (confirmation emails)

1. Sign up at https://signup.mailgun.com.
2. Pick a sending domain:
   - **Quick test**: use the sandbox domain (`sandboxXXXX.mailgun.org`). Sandbox domains only deliver to **Authorized Recipients**, so add your own address under **Sending → Overview → Authorized Recipients** and confirm the email Mailgun sends you.
   - **Production**: go to **Sending → Domains → Add new domain** and enter something like `mg.yourdomain.com`. Add the DNS records it shows (TXT/SPF, DKIM, MX, CNAME) at your DNS provider, then click **Verify**.
3. Go to **Account → API Security** (or **Sending → Domain settings → Sending API keys**), create an API key, and copy it.
4. Fill in `.env.local`:
   ```
   MAILGUN_API_KEY=key-or-api-key-value
   MAILGUN_DOMAIN=sandboxXXXX.mailgun.org        # or mg.yourdomain.com
   MAILGUN_FROM=Mana <hello@sandboxXXXX.mailgun.org>
   MAILGUN_API_BASE=https://api.mailgun.net      # https://api.eu.mailgun.net for EU domains
   STORE_NOTIFICATION_EMAIL=you@example.com       # receives "new order" alerts
   ```
5. Restart the dev server and place an order. The customer gets a confirmation email, the store owner gets a notification, and every send attempt is logged in the `email_log` table.

## 4. Payment: bank transfer and pay on delivery

Checkout offers two ways to pay, and neither takes money online:

- **Bank transfer**: the customer sees your account details at checkout, on the confirmation page, and in the confirmation email, with their order number as the payment reference.
- **Pay on delivery**: the customer pays the courier when the parcel arrives.

Add your account details to `.env.local`:

```
NEXT_PUBLIC_BANK_NAME=First Bank
NEXT_PUBLIC_BANK_ACCOUNT_NAME=Mana Store Ltd
NEXT_PUBLIC_BANK_ACCOUNT_NUMBER=0123456789
```

Every order starts with status `pending` (shown as "Awaiting payment"). When a transfer arrives, or the courier hands over the cash, open Supabase **Table Editor → orders** and change `status` to `paid`. Later statuses are `processing`, `shipped`, and `delivered`.

## 5. Deploying (e.g. Vercel)

- Add every variable from `.env.local` to the host's environment settings, and set `NEXT_PUBLIC_SITE_URL=https://your-domain.com`.
- Add the production domain to **Google → Authorized JavaScript origins** and to **Supabase → URL Configuration → Redirect URLs** (`https://your-domain.com/auth/callback`).

## Features

- Home and shop pages with category sidebar, search, sorting, pagination, and New / Best Seller badges
- Product detail page with buy box and recommendations
- Cart drawer that persists in the browser
- Checkout with shipping choice and two payment options (bank transfer or pay on delivery). Prices are recalculated on the server, and the order is stored in Supabase
- Order confirmation emails to the customer and the store (Mailgun)
- Google sign-in, account page, and order history (protected by row level security)
- Newsletter sign-up (stored in Supabase, with a welcome email)
- All icons are SVGs (lucide-react plus inline brand glyphs). No emoji are used.
