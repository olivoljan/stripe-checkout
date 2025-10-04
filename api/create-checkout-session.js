import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Allowed origins (for Webflow and live site)
const allowedOrigins = [
  "https://olivolja-dev.webflow.io",
  "https://www.olivkassen.com",
  "https://olivkassen.com"
];

export default async function handler(req, res) {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { priceId, cancelUrl } = req.body;

    if (!priceId) {
      return res.status(400).json({ error: "Missing priceId" });
    }

    const domain = process.env.DOMAIN_URL || "https://stripe-checkout-sage.vercel.app";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card", "klarna"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${domain}/tack?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${domain}/avbruten`,
      shipping_address_collection: {
        allowed_countries: ["SE", "NO", "DK", "FI"],
      },
      automatic_tax: { enabled: true },
      locale: "auto",
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe session error:", err);
    return res.status(500).json({ error: err.message });
  }
}
