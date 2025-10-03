import express from "express";
import Stripe from "stripe";

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Create Checkout Session
app.post("/create-checkout-session", async (req, res) => {
  try {
    // Pick priceId from request body, or use default
    const { priceId } = req.body;

    if (!priceId) {
      return res.status(400).json({ error: "Missing priceId in body" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "klarna"], // enable both
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("✅ Server running on port 3000"));
