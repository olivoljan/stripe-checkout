import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Allowed origins
const allowedOrigins = [
  "https://olivolja-dev.webflow.io",  // Webflow dev
  "https://olivkassen.com"            // Production
];

export default async function handler(req, res) {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight (OPTIONS)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "POST") {
    try {
      const { priceId, cancelUrl } = req.body;

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card", "klarna"],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: "https://olivkassen.com/tack",
        cancel_url: cancelUrl || "https://olivkassen.com/avbruten",
        shipping_address_collection: {
          allowed_countries: ["SE", "DK", "NO", "FI"], // adjust if needed
        },
        locale: "auto"
      });

      return res.status(200).json({ url: session.url });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }
}
