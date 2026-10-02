import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog",
  description: "Buying guides, teardown notes and behind the scenes from the Mana team.",
};

const POSTS = [
  {
    slug: "choosing-headphones",
    title: "How we pick headphones for the shop",
    excerpt:
      "Forty hours of listening, one spreadsheet, and the reason we rejected nine models that looked fine on paper.",
    category: "Buying guide",
    minutes: 7,
    date: "March 2026",
  },
  {
    slug: "supabase-orders",
    title: "Storing orders in Supabase without trusting the client",
    excerpt:
      "Our checkout re-prices every line server side, writes orders and order_items, and only then sends the Mailgun receipt.",
    category: "Engineering",
    minutes: 9,
    date: "February 2026",
  },
  {
    slug: "mailgun-deliverability",
    title: "Making confirmation email actually arrive",
    excerpt:
      "SPF, DKIM, a verified sending domain and the four headers that keep Gmail happy about order receipts.",
    category: "Engineering",
    minutes: 6,
    date: "February 2026",
  },
  {
    slug: "google-auth-in-ten-minutes",
    title: "Google sign in in ten minutes with Supabase",
    excerpt:
      "One OAuth client, one redirect URI, and no password table to defend. Here is the exact configuration we use.",
    category: "Engineering",
    minutes: 5,
    date: "January 2026",
  },
  {
    slug: "desk-setup-guide",
    title: "The desk setup we would actually buy",
    excerpt:
      "A lamp, a stand, a hub and one cable. Four pieces that fix 80% of the pain in a working day.",
    category: "Buying guide",
    minutes: 8,
    date: "January 2026",
  },
  {
    slug: "why-free-shipping-200k",
    title: "Why free shipping starts at ₦200,000",
    excerpt:
      "The arithmetic behind our threshold, and why we would rather tell you than quietly bake it into prices.",
    category: "Company",
    minutes: 4,
    date: "December 2025",
  },
];

export default function BlogPage() {
  const [featured, ...rest] = POSTS;

  return (
    <div className="mx-auto w-full max-w-[1240px] px-4 py-10 sm:px-6">
      <header>
        <p className="text-xs uppercase tracking-[0.14em] text-ink-muted">Blog</p>
        <h1 className="mt-3 text-[36px] font-semibold leading-[1.05] tracking-[-0.04em] sm:text-[54px]">
          Notes from the shop floor
        </h1>
      </header>

      <article className="mt-10 grid gap-8 rounded-card border border-line bg-white p-6 sm:p-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div className="aspect-[16/10] rounded-2xl rail-gradient border border-line" />
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-ink-muted">{featured.category}</p>
          <h2 className="mt-3 text-[26px] font-semibold leading-tight tracking-[-0.03em] sm:text-[32px]">
            {featured.title}
          </h2>
          <p className="mt-4 text-sm leading-7 text-ink-muted">{featured.excerpt}</p>
          <p className="mt-5 flex items-center gap-3 text-xs text-ink-muted">
            <Clock3 className="h-3.5 w-3.5" strokeWidth={1.7} />
            {featured.minutes} min read · {featured.date}
          </p>
          <Link
            href={`/blog#${featured.slug}`}
            className="mt-6 inline-flex items-center gap-2 rounded-pill bg-ink px-6 py-3 text-sm font-medium text-white transition hover:bg-ink-soft"
          >
            Read the article
            <ArrowUpRight className="h-4 w-4" strokeWidth={1.8} />
          </Link>
        </div>
      </article>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((post) => (
          <article
            key={post.slug}
            id={post.slug}
            className="flex h-full scroll-mt-28 flex-col rounded-card border border-line bg-white p-6"
          >
            <p className="text-xs uppercase tracking-[0.12em] text-ink-muted">{post.category}</p>
            <h2 className="mt-3 text-lg font-semibold leading-snug tracking-[-0.02em]">
              {post.title}
            </h2>
            <p className="mt-3 flex-1 text-sm leading-6 text-ink-muted">{post.excerpt}</p>
            <p className="mt-5 flex items-center gap-2 text-xs text-ink-muted">
              <Clock3 className="h-3.5 w-3.5" strokeWidth={1.7} />
              {post.minutes} min read · {post.date}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
