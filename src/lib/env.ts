/**
 * Central place for every credential the app reads.
 *
 * Nothing here throws when a value is missing: each integration exposes an
 * `isXConfigured()` helper so the UI can degrade gracefully (bundled catalogue,
 * console-logged emails) until you paste your own keys into `.env.local`.
 */

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",

  mailgunApiKey: process.env.MAILGUN_API_KEY ?? "",
  mailgunDomain: process.env.MAILGUN_DOMAIN ?? "",
  mailgunFrom: process.env.MAILGUN_FROM ?? "",
  mailgunApiBase: process.env.MAILGUN_API_BASE || "https://api.mailgun.net",
  storeNotificationEmail: process.env.STORE_NOTIFICATION_EMAIL ?? "",

  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  storeName: process.env.NEXT_PUBLIC_STORE_NAME || "Mana",
} as const;

export function isSupabaseConfigured(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

export function isSupabaseAdminConfigured(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);
}

export function isMailgunConfigured(): boolean {
  return Boolean(env.mailgunApiKey && env.mailgunDomain && env.mailgunFrom);
}

/** Small helper so the UI can explain *what* is still unconfigured. */
export function integrationStatus() {
  return {
    supabase: isSupabaseConfigured(),
    supabaseAdmin: isSupabaseAdminConfigured(),
    mailgun: isMailgunConfigured(),
  };
}
