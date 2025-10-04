import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // --- Allowed origins ---
  const allowedOrigins = [
    "https://olivolja-dev.webflow.io", 
    "https://olivkassen.com"
  ];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "POST") {
    try {
      const { priceId, successUrl, cancelUrl } = req.body;

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card", "klarna"],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        billing_address_collection: "required",
        locale: "auto",
      });

      return res.status(200).json({ url: session.url });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  } else {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ error: "Method not allowed" });
  }
}
