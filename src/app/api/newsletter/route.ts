import { NextResponse } from "next/server";
import { newsletterWelcomeEmail } from "@/lib/emails";
import { env } from "@/lib/env";
import { sendAndLog } from "@/lib/mailgun";
import { getAdminSupabase } from "@/lib/supabase/admin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  let email = "";

  try {
    const body = (await request.json()) as { email?: unknown };
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request body." }, { status: 400 });
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, message: "That email address does not look right." },
      { status: 400 },
    );
  }

  const admin = getAdminSupabase();
  let alreadySubscribed = false;

  if (admin) {
    const { error } = await admin.from("newsletter_subscribers").insert({ email, source: "footer" });

    if (error && error.code === "23505") {
      alreadySubscribed = true;
    } else if (error) {
      if (error.code === "42P01") {
        return NextResponse.json(
          {
            ok: false,
            message:
              "The subscribers table is missing. Run supabase/schema.sql in the Supabase SQL editor.",
          },
          { status: 500 },
        );
      }
      console.error("[mana] newsletter insert failed:", error.message);
      return NextResponse.json(
        { ok: false, message: "We could not save your subscription. Please try again." },
        { status: 500 },
      );
    }
  } else {
    console.warn("[mana] Supabase is not configured - subscriber was not persisted:", email);
  }

  const welcome = newsletterWelcomeEmail(email);
  const mail = await sendAndLog({
    to: email,
    subject: welcome.subject,
    html: welcome.html,
    template: "newsletter-welcome",
    tags: ["newsletter"],
    replyTo: env.storeNotificationEmail || undefined,
  });

  if (env.storeNotificationEmail) {
    await sendAndLog({
      to: env.storeNotificationEmail,
      subject: `[Mana] New subscriber: ${email}`,
      html: `<p style="font-family:sans-serif;font-size:14px;">${email} just subscribed to the Mana newsletter.</p>`,
      template: "newsletter-internal",
      tags: ["newsletter", "internal"],
    });
  }

  return NextResponse.json({
    ok: true,
    emailSent: mail.ok,
    persisted: Boolean(admin),
    message: alreadySubscribed
      ? "You were already on the list - no harm in a second hello."
      : "You are on the list.",
  });
}
