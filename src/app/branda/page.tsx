import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Database, Mail, ShieldCheck, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Branda - about Mana",
  description:
    "Mana is a small team that curates devices, audio and home tech. Read how we pick products and how this storefront is wired together.",
};

const TEAM = [
  { name: "Amara Okafor", role: "Founder, curation", blurb: "Spends far too long comparing ear cushions." },
  { name: "Tomas Lindqvist", role: "Head of supply", blurb: "Knows which factory actually makes the good hinge." },
  { name: "Priya Raman", role: "Customer care", blurb: "Answers every email that reaches support." },
  { name: "Diego Alvarez", role: "Studio", blurb: "Designs the shelves you see on every product page." },
];

const VALUES = [
  { icon: ShieldCheck, title: "Two year warranty, in house", copy: "If it breaks, you talk to us, not a call centre." },
  { icon: Users, title: "Small team, named humans", copy: "Four people, one shared inbox, no chatbots." },
  { icon: Database, title: "Boringly reliable tooling", copy: "Supabase for data, Mailgun for mail, Google for sign in." },
];

const SETUP_STEPS = [
  {
    title: "1. Supabase project",
    copy: "Create a project, then run supabase/schema.sql in the SQL editor and `npm run seed` to load the catalogue.",
  },
  {
    title: "2. Google Cloud OAuth client",
    copy: "Create an OAuth 2.0 Web client, add the Supabase callback as an authorised redirect URI, and paste the id/secret into Supabase > Authentication > Providers > Google.",
  },
  {
    title: "3. Mailgun domain",
    copy: "Verify a sending domain, copy the API key into MAILGUN_API_KEY, and set MAILGUN_FROM to an address on that domain.",
  },
  {
    title: "4. Environment file",
    copy: "Copy .env.local.example to .env.local, fill in the values, restart `npm run dev`.",
  },
];

export default function BrandaPage() {
  return (
    <div className="mx-auto w-full max-w-[1240px] px-4 py-10 sm:px-6">
      <header className="max-w-[62ch]">
        <p className="text-xs uppercase tracking-[0.14em] text-ink-muted">Branda</p>
        <h1 className="mt-3 text-[36px] font-semibold leading-[1.05] tracking-[-0.04em] sm:text-[54px]">
          We only stock what we would keep at home
        </h1>
        <p className="mt-5 text-sm leading-7 text-ink-muted">
          Mana started as a shared spreadsheet between four friends who kept buying the same gadgets
          and returning half of them. Today it is a small shop with a short catalogue: phones,
          audio, storage and the smart home pieces that survive a year of real use.
        </p>
      </header>

      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {VALUES.map(({ icon: Icon, title, copy }) => (
          <div key={title} className="rounded-card border border-line bg-white p-6">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-surface">
              <Icon className="h-5 w-5 text-ink" strokeWidth={1.7} />
            </span>
            <h2 className="mt-4 text-base font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-ink-muted">{copy}</p>
          </div>
        ))}
      </div>

      <section className="mt-14">
        <h2 className="text-[26px] font-semibold tracking-[-0.03em] sm:text-[32px]">Meet the team</h2>
        <div className="mt-6 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {TEAM.map((member) => (
            <article key={member.name}>
              <div className="aspect-[4/5] rounded-card rail-gradient border border-line" />
              <h3 className="mt-4 text-base font-semibold">{member.name}</h3>
              <p className="text-xs uppercase tracking-[0.1em] text-ink-muted">{member.role}</p>
              <p className="mt-2 text-sm text-ink-muted">{member.blurb}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="setup" className="mt-16 scroll-mt-28 rounded-card bg-ink-soft p-6 sm:p-10">
        <p className="text-xs uppercase tracking-[0.14em] text-white/50">Developer notes</p>
        <h2 className="mt-3 text-[26px] font-semibold tracking-[-0.03em] text-white sm:text-[34px]">
          How this store was wired together
        </h2>
        <p className="mt-3 max-w-[64ch] text-sm leading-7 text-white/70">
          Next.js App Router for the storefront, Supabase for products, orders and auth, Mailgun for
          transactional email and Google Cloud Console for the OAuth client. Everything below is a
          five minute job and the full walkthrough lives in the README.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {SETUP_STEPS.map((step) => (
            <div key={step.title} className="rounded-2xl bg-white/5 p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                <Mail className="h-4 w-4" strokeWidth={1.7} />
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/65">{step.copy}</p>
            </div>
          ))}
        </div>

        <Link
          href="/blog"
          className="mt-8 inline-flex items-center gap-2 rounded-pill bg-white px-6 py-3 text-sm font-medium text-ink transition hover:bg-white/90"
        >
          Read the engineering notes
          <ArrowUpRight className="h-4 w-4" strokeWidth={1.8} />
        </Link>
      </section>
    </div>
  );
}
