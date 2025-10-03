import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { priceId, cancelUrl } = req.body;

    if (!priceId) {
      return res.status(400).json({ error: "Missing priceId" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: "https://olivolja-dev.webflow.io/tack",
      cancel_url: cancelUrl || "https://olivolja-dev.webflow.io/test-checkout",
      shipping_address_collection: {
        allowed_countries: ["SE"]
      },
      locale: "auto"
    });

    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(500).json({ error: err.message });
  }
}