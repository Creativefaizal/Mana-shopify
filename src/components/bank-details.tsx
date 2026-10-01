import { Landmark } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { bankDetails, isBankConfigured } from "@/lib/payment";

/** The store's bank account, shown wherever a customer needs to make a transfer. */
export function BankDetails({ reference, amount }: { reference: string; amount?: number }) {
  if (!isBankConfigured()) {
    return (
      <p className="text-xs leading-5 text-ink-muted">
        Bank details will be emailed with your order confirmation. (Store owner: set the
        NEXT_PUBLIC_BANK_* values in .env.local to show them here.)
      </p>
    );
  }

  const rows: Array<[string, string]> = [
    ["Bank", bankDetails.bankName],
    ["Account name", bankDetails.accountName],
    ["Account number", bankDetails.accountNumber],
    ...(amount !== undefined ? ([["Amount", formatMoney(amount)]] as Array<[string, string]>) : []),
    ["Reference", reference],
  ];

  return (
    <div>
      <p className="flex items-center gap-2 text-sm font-medium text-ink">
        <Landmark className="h-4 w-4 text-ink-muted" strokeWidth={1.7} />
        Transfer to
      </p>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-ink-muted">{label}</dt>
            <dd className="font-medium text-ink break-words">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
