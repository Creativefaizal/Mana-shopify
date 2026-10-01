/**
 * The two ways to pay at Mana. Shared by the checkout form, the API route,
 * the receipt and the emails, so the labels never drift apart.
 *
 * Bank details are public by nature (every bank-transfer customer sees them),
 * which is why they live in NEXT_PUBLIC_ variables.
 */

export const PAYMENT_METHODS = ["bank_transfer", "pay_on_delivery"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  bank_transfer: "Bank transfer",
  pay_on_delivery: "Pay on delivery",
};

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return PAYMENT_METHODS.includes(value as PaymentMethod);
}

export function paymentLabel(method: string): string {
  return isPaymentMethod(method) ? PAYMENT_LABELS[method] : method;
}

export const bankDetails = {
  bankName: process.env.NEXT_PUBLIC_BANK_NAME ?? "",
  accountName: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME ?? "",
  accountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER ?? "",
} as const;

export function isBankConfigured(): boolean {
  return Boolean(bankDetails.bankName && bankDetails.accountName && bankDetails.accountNumber);
}
