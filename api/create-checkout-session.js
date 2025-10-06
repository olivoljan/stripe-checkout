import Stripe from "stripe";

// Dynamically pick the correct key based on environment
const stripe = new Stripe(
  process.env.VERCEL_ENV === "preview"
    ? process.env.STRIPE_TEST_KEY // used in Vercel Preview (test-checkout)
    : process.env.STRIPE_SECRET_KEY // used in Vercel Production (live)
);

// Allow requests only from these domains
const allowedOrigins = [
  "https://olivolja-dev.webflow.io",
  "https://olivkassen.com",
  "https://www.olivkassen.com",
];

export default async function handler(req, res) {
  const origin = req.headers.origin;

  // ✅ CORS setup
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Preflight request
  if (req.method === "OPTIONS") return res.status(200).end();

  // ✅ Only POST allowed
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { priceId, cancelUrl } = req.body;

    if (!priceId) {
      return res.status(400).json({ error: "Missing priceId" });
    }

    // ✅ Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card", "klarna"],

      line_items: [{ price: priceId, quantity: 1 }],

      // ✅ Success + cancel handling
      success_url: "https://olivkassen.com/tack?session_id={CHECKOUT_SESSION_ID}",
      cancel_url:
        cancelUrl ||
        req.headers.referer ||
        "https://olivkassen.com/abonnemang",

      // ✅ Add phone number & shipping
      phone_number_collection: { enabled: true },
      shipping_address_collection: {
        allowed_countries: ["SE", "NO", "DK", "FI"],
      },

      // ✅ Auto VAT calculation (Stripe Tax)
      automatic_tax: { enabled: true },

      // ✅ Localized checkout
      locale: "auto",
    });

    // ✅ Send checkout URL to client
    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe session error:", err);
    return res.status(500).json({ error: err.message });
  }
}
