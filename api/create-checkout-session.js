import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Allowed origins for CORS
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

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "POST") {
    try {
      const { priceId, cancelUrl } = req.body;

      if (!priceId) return res.status(400).json({ error: "Missing priceId" });

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card", "klarna"],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${process.env.DOMAIN_URL}/tack?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${process.env.DOMAIN_URL}/abonnemang`,
        shipping_address_collection: {
          allowed_countries: ["SE", "NO", "DK", "FI"],
        },
        customer_update: {
          address: "auto",
          name: "auto",
          shipping: "auto",
        },
        custom_text: {
          submit: {
            message: "Du kan alltid gå tillbaka till Olivkassen för att ändra ditt abonnemang.",
          },
        },
        locale: "auto",
        phone_number_collection: { enabled: true }, // 👈 adds phone field
      });

      return res.status(200).json({ url: session.url });
    } catch (err) {
      console.error("Stripe session error:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader("Allow", ["POST"]);
  res.status(405).json({ error: "Method not allowed" });
}
