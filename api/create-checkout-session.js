import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { priceId, cancelUrl } = req.body;

    if (!priceId) {
      return res.status(400).json({ error: "Missing priceId" });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // Success page (always goes to thank-you page)
      success_url: "https://olivkassen.com/tack?session_id={CHECKOUT_SESSION_ID}",

      // Cancel page (dynamic → referrer or fallback)
      cancel_url: cancelUrl || "https://olivkassen.com/avbruten",

      // Enable card + Klarna
      payment_method_types: ["card", "klarna"],

      // Auto-fill delivery address from customer
      customer_update: {
        address: "auto",
      },

      // Require shipping address (Nordics only for now)
      shipping_address_collection: {
        allowed_countries: ["SE", "NO", "DK", "FI"],
      },

      // Auto-detect checkout language
      locale: "auto",
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe session error:", err);
    return res.status(500).json({ error: err.message });
  }
}
