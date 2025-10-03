import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card", "klarna"],
      line_items: [
        // 1 liter (1, 3, 6 months)
        { price: "price_1SCnsoEKCocP3sE0nnVcw3B2", quantity: 1 },
        { price: "price_1SCnsoEKCocP3sE08vL0YVc5", quantity: 1 },
        { price: "price_1SCnsoEKCocP3sE0AEPypSLw", quantity: 1 },

        // 2 liter (1, 3, 6 months)
        { price: "price_1SCnrwEKCocP3sE0IEtNGNrf", quantity: 1 },
        { price: "price_1SCnrwEKCocP3sE06kNcBy2X", quantity: 1 },
        { price: "price_1SCnrwEKCocP3sE0QwtcBykt", quantity: 1 },

        // 3 liter (1, 3, 6 months)
        { price: "price_1SCneBEKCocP3sE035p9ANCI", quantity: 1 },
        { price: "price_1SCneBEKCocP3sE0zItMU5kX", quantity: 1 },
        { price: "price_1SCneBEKCocP3sE0JCfmIl3P", quantity: 1 },
      ],
      success_url: "https://olivolja-dev.webflow.io/tack",
      cancel_url: "https://olivolja-dev.webflow.io/checkout",
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
