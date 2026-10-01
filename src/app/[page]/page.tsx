import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, MapPin, Phone } from "lucide-react";
import { CONTENT_PAGES } from "@/lib/content-pages";

export function generateStaticParams() {
  return Object.keys(CONTENT_PAGES).map((page) => ({ page }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const { page } = await params;
  const content = CONTENT_PAGES[page];
  if (!content) return { title: "Page not found" };
  return { title: content.title, description: content.intro };
}

const CONTACT_CARDS = [
  { Icon: Mail, label: "Email", value: "support@mana.shop" },
  { Icon: Phone, label: "Phone", value: "+1 (555) 0134" },
  { Icon: MapPin, label: "Studio", value: "Amsterdam, NL" },
];

export default async function ContentPage({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  const content = CONTENT_PAGES[page];
  if (!content) notFound();

  return (
    <div className="mx-auto w-full max-w-[860px] px-4 py-12 sm:px-6">
      <p className="text-xs uppercase tracking-[0.14em] text-ink-muted">{content.eyebrow}</p>
      <h1 className="mt-3 text-[34px] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-[46px]">
        {content.title}
      </h1>
      <p className="mt-5 max-w-[68ch] text-sm leading-7 text-ink-muted">{content.intro}</p>

      {page === "contact" && (
        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {CONTACT_CARDS.map(({ Icon, label, value }) => (
            <li
              key={label}
              className="flex items-start gap-3 rounded-card border border-line bg-white p-5"
            >
              <Icon className="mt-0.5 h-4 w-4 text-ink-muted" strokeWidth={1.7} />
              <span className="text-sm">
                <span className="block font-medium">{label}</span>
                <span className="text-ink-muted">{value}</span>
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-10 space-y-10">
        {content.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-lg font-semibold tracking-[-0.02em]">{section.heading}</h2>
            <div className="mt-3 space-y-2">
              {section.body.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-7 text-ink-muted">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-card border border-line bg-white p-6">
        <p className="text-sm text-ink-muted">
          Still stuck?{" "}
          <Link href="/contact" className="font-medium text-ink underline decoration-dotted">
            Talk to the team
          </Link>{" "}
          or browse{" "}
          <Link href="/faq" className="font-medium text-ink underline decoration-dotted">
            the FAQ
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
