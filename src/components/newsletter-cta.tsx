"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";

export function NewsletterCta() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [emailSent, setEmailSent] = useState(true);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (state === "loading") return;
    setState("loading");
    setMessage("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = (await response.json()) as {
        ok: boolean;
        message?: string;
        emailSent?: boolean;
      };

      if (!response.ok || !payload.ok) {
        setState("error");
        setMessage(payload.message ?? "We could not save that address. Please try again.");
        return;
      }

      setState("done");
      setEmailSent(payload.emailSent !== false);
      setMessage("You are on the list. Check your inbox for a confirmation.");
      setEmail("");
    } catch {
      setState("error");
      setMessage("Network hiccup. Please try again in a moment.");
    }
  };


  return (
    <section className="mx-auto w-full max-w-[1240px] px-4 sm:px-6">
      <div className="grid gap-8 rounded-card bg-ink-soft px-6 py-10 sm:px-10 sm:py-12 lg:grid-cols-[1.1fr_1fr] lg:items-start">
        <div>
          <h2 className="text-[30px] font-semibold leading-[1.08] tracking-[-0.03em] text-white sm:text-[42px]">
            Ready to Get
            <br />
            Our New Stuff?
          </h2>

          <form onSubmit={submit} className="mt-7 max-w-[420px]">
            <div className="flex items-center gap-2 rounded-pill bg-white p-1.5 pl-4">
              <label className="sr-only" htmlFor="newsletter-email">
                Your email
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Your Email"
                className="w-full bg-transparent py-2.5 text-sm text-ink outline-none placeholder:text-ink-muted"
              />
              <button
                type="submit"
                disabled={state === "loading"}
                className="inline-flex shrink-0 items-center gap-2 rounded-pill bg-ink px-6 py-2.5 text-sm font-medium text-white transition hover:bg-black disabled:opacity-70"
              >
                {state === "loading" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
                ) : state === "done" ? (
                  <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
                ) : (
                  <Send className="h-3.5 w-3.5" strokeWidth={2} />
                )}
                Send
              </button>
            </div>

            {message && (
              <p
                role="status"
                className={`mt-3 text-sm ${state === "error" ? "text-sale" : "text-white/80"}`}
              >
                {message}
              </p>
            )}

            {state === "done" && !emailSent && (
              <p className="mt-2 text-xs text-white/45">
                Developer note: Mailgun keys are not set yet, so this confirmation was only logged
                on the server. Add MAILGUN_API_KEY, MAILGUN_DOMAIN and MAILGUN_FROM to send it for
                real.
              </p>
            )}
          </form>
        </div>

        <div className="lg:pt-4">
          <h3 className="text-sm font-semibold text-white">Mana for Homes and Needs</h3>
          <p className="mt-3 max-w-[46ch] text-sm leading-6 text-white/70">
            We listen to your needs, identify the best approach and then source the piece that
            actually fits - whether that is a desk setup, a listening room or a smarter home.
            Subscribers hear about restocks and Mana Club pricing before anyone else.
          </p>
        </div>
      </div>
    </section>
  );
}
