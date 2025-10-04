import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: "price_1SCnsoEKCocP3sE0nnVcw3B2", // 1L, 1 month
          quantity: 1,
        },
        {
          price: "price_1SCnsoEKCocP3sE08vL0YVc5", // 1L, 3 months
          quantity: 1,
        },
        {
          price: "price_1SCnsoEKCocP3sE0AEPypSLw", // 1L, 6 months
          quantity: 1,
        },
        {
          price: "price_1SCnrwEKCocP3sE0IEtNGNrf", // 2L, 1 month
          quantity: 1,
        },
        {
          price: "price_1SCnrwEKCocP3sE06kNcBy2X", // 2L, 3 months
          quantity: 1,
        },
        {
          price: "price_1SCnrwEKCocP3sE0QwtcBykt", // 2L, 6 months
          quantity: 1,
        },
        {
          price: "price_1SCneBEKCocP3sE035p9ANCI", // 3L, 1 month
          quantity: 1,
        },
        {
          price: "price_1SCneBEKCocP3sE0zItMU5kX", // 3L, 3 months
          quantity: 1,
        },
        {
          price: "price_1SCneBEKCocP3sE0JCfmIl3P", // 3L, 6 months
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: "https://olivkassen.com/tack",
      cancel_url: "https://olivkassen.com/avbruten",
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
