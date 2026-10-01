import { env, isMailgunConfigured } from "./env";
import { getAdminSupabase } from "./supabase/admin";

export interface MailInput {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  tags?: string[];
}

export interface MailResult {
  ok: boolean;
  id?: string;
  error?: string;
  /** true when the request was skipped because Mailgun is not configured yet. */
  skipped?: boolean;
}

/**
 * Sends a transactional email through the Mailgun REST API.
 *
 * We deliberately use `fetch` + `URLSearchParams` instead of the official SDK so
 * there is no extra dependency and no Node-only code in the bundle:
 *   POST {MAILGUN_API_BASE}/v3/{MAILGUN_DOMAIN}/messages
 */
export async function sendMail(input: MailInput): Promise<MailResult> {
  const recipients = Array.isArray(input.to) ? input.to : [input.to];

  if (!isMailgunConfigured()) {
    console.info(
      `[mana] Mailgun is not configured - would have emailed ${recipients.join(", ")} :: ${input.subject}`,
    );
    return { ok: false, skipped: true, error: "mailgun-not-configured" };
  }

  const body = new URLSearchParams();
  body.set("from", env.mailgunFrom);
  for (const recipient of recipients) body.append("to", recipient);
  body.set("subject", input.subject);
  body.set("html", input.html);
  body.set("text", input.text ?? stripHtml(input.html));
  if (input.replyTo) body.set("h:Reply-To", input.replyTo);
  for (const tag of input.tags ?? []) body.append("o:tag", tag);

  try {
    const response = await fetch(
      `${env.mailgunApiBase.replace(/\/$/, "")}/v3/${env.mailgunDomain}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`api:${env.mailgunApiKey}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      },
    );

    const payload = (await response.json().catch(() => ({}))) as {
      id?: string;
      message?: string;
    };

    if (!response.ok) {
      const error = payload.message ?? `Mailgun responded with ${response.status}`;
      console.error("[mana] Mailgun error:", error);
      return { ok: false, error };
    }

    return { ok: true, id: payload.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Mailgun failure";
    console.error("[mana] Mailgun request failed:", message);
    return { ok: false, error: message };
  }
}

/** Audit trail: every send attempt ends up in the `email_log` table. */
export async function sendAndLog(
  input: MailInput & { template: string; orderNumber?: string },
): Promise<MailResult> {
  const result = await sendMail(input);
  const supabase = getAdminSupabase();

  if (supabase) {
    try {
      await supabase.from("email_log").insert({
        to_email: Array.isArray(input.to) ? input.to.join(", ") : input.to,
        subject: input.subject,
        template: input.template,
        status: result.ok ? "sent" : result.skipped ? "skipped" : "failed",
        provider_id: result.id ?? null,
        error: result.error ?? null,
        order_number: input.orderNumber ?? null,
      });
    } catch (error) {
      console.warn("[mana] could not write email_log:", error);
    }
  }

  return result;
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|tr|h1|h2|h3)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
