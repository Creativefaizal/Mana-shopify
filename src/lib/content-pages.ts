/** Static marketing / support copy, rendered by app/[page]/page.tsx. */

export interface ContentPage {
  title: string;
  eyebrow: string;
  intro: string;
  sections: { heading: string; body: string[] }[];
}

export const CONTENT_PAGES: Record<string, ContentPage> = {
  contact: {
    title: "Contact us",
    eyebrow: "Support",
    intro:
      "Four humans read this inbox between 09:00 and 18:00 CET, Monday to Friday. Orders, returns, warranty claims and product questions all land in the same place.",
    sections: [
      {
        heading: "Email is fastest",
        body: [
          "support@mana.shop - replies within one working day, usually much sooner.",
          "Include your order number (it looks like MANA-XXXXXX) and we can act immediately.",
        ],
      },
      {
        heading: "Prefer the phone?",
        body: [
          "+1 (555) 0134 - Monday to Friday, 09:00 to 18:00 CET.",
          "Outside those hours leave a voicemail with your order number and we call back the next morning.",
        ],
      },
      {
        heading: "Studio address",
        body: [
          "Mana Studio, 14 Kanalstraat, Amsterdam, Netherlands.",
          "Collection is by appointment only, so that someone is actually here to hand you the box.",
        ],
      },
    ],
  },
  shipping: {
    title: "Shipping",
    eyebrow: "Support",
    intro:
      "Standard shipping is free on every order over $150. Below that it is a flat $9.90, and express is $24.90 whatever the basket size.",
    sections: [
      {
        heading: "How long it takes",
        body: [
          "Standard: 3 to 5 working days inside the EU and US.",
          "Express: next working day for orders placed before 15:00 CET.",
          "Every parcel is tracked and the tracking link is inside your confirmation email.",
        ],
      },
      {
        heading: "Where we ship",
        body: [
          "EU, UK, US, Canada, Australia, Singapore and Japan from our own stock.",
          "Everything else is quoted at checkout based on weight.",
        ],
      },
      {
        heading: "Customs and duties",
        body: [
          "Orders shipped outside the EU may attract import duty, which is payable by the receiver.",
          "We declare the true value on every parcel. We will not mark anything as a gift.",
        ],
      },
    ],
  },
  returns: {
    title: "Returns",
    eyebrow: "Support",
    intro:
      "Thirty days to change your mind, whether the box is open or not. If a product is faulty we pay the return postage, always.",
    sections: [
      {
        heading: "How to start a return",
        body: [
          "Email support@mana.shop with your order number and what you would like to return.",
          "We send a prepaid label where applicable, plus the address for the rest.",
        ],
      },
      {
        heading: "Refund timing",
        body: [
          "Refunds are issued to the original payment method within five working days of arrival.",
          "Exchanges for a different colour are sent out the same day we receive the return.",
        ],
      },
      {
        heading: "What we cannot take back",
        body: [
          "Products with visible physical damage caused after delivery.",
          "Personalised items, or hygiene-sealed items once the seal is broken.",
        ],
      },
    ],
  },
  faq: {
    title: "Frequently asked questions",
    eyebrow: "Support",
    intro:
      "The questions our inbox gets most, answered properly. If yours is missing, email support@mana.shop.",
    sections: [
      {
        heading: "Do I need an account to order?",
        body: [
          "No. Guest checkout works end to end and you still receive a confirmation email.",
          "Signing in with Google simply keeps your order history in one place for later.",
        ],
      },
      {
        heading: "How can I pay?",
        body: [
          "Two ways: bank transfer, or pay on delivery. No card details are ever taken online.",
          "For bank transfer, use your order number (MANA-XXXXXX) as the reference. We ship as soon as the money lands. For pay on delivery, pay the courier in cash or by card when your parcel arrives.",
        ],
      },
      {
        heading: "How do I know my order was saved?",
        body: [
          "The confirmation screen shows the order number, and the same order is written to Supabase with its line items.",
          "Signed in customers can find it under Account, My orders.",
        ],
      },
      {
        heading: "Can I change an order after placing it?",
        body: [
          "Within an hour of ordering, usually yes - email us and we intercept it before dispatch.",
          "After dispatch, treat it as a return.",
        ],
      },
    ],
  },
  terms: {
    title: "Terms of Service",
    eyebrow: "Legal",
    intro:
      "These terms cover every purchase made from the Mana storefront. Last updated for the current release of the shop.",
    sections: [
      {
        heading: "Orders and acceptance",
        body: [
          "An order is an offer to buy, and the contract forms when we send the confirmation email.",
          "Prices, stock and delivery estimates are validated server side at the moment the order is created.",
        ],
      },
      {
        heading: "Accounts",
        body: [
          "You are responsible for activity on your account, which is authenticated through Google.",
          "We store the email, display name and avatar Google supplies, plus the orders you place.",
        ],
      },
      {
        heading: "Liability",
        body: [
          "Our liability is limited to the value of the order in question.",
          "Nothing here limits rights you have under mandatory consumer law.",
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    eyebrow: "Legal",
    intro:
      "What we collect, why we collect it, and how to get it out again. No advertising trackers, no data brokers.",
    sections: [
      {
        heading: "What we store",
        body: [
          "Order data: name, email, phone, shipping address, items, totals and status - held in Supabase.",
          "Account data: your Google email, name and avatar, plus the identifier Google returns.",
          "Newsletter data: your email address, if you subscribed.",
        ],
      },
      {
        heading: "Who processes it",
        body: [
          "Supabase hosts the database and handles authentication.",
          "Mailgun delivers transactional email such as order confirmations.",
          "Google performs the sign in you choose to use.",
        ],
      },
      {
        heading: "Your rights",
        body: [
          "Email support@mana.shop to export or delete everything tied to your account.",
          "Deleting an account does not delete invoices we must retain for tax purposes.",
        ],
      },
    ],
  },
};
