// /api/session-details.js

import Stripe from "stripe";

// --- Initialize Stripe ---
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

export default async function handler(req, res) {
  // --- CORS setup ---
  const allowedOrigins = [
    "https://olivolja-dev.webflow.io",  // Webflow test
    "https://olivkassen.com",           // Live
    "https://www.olivkassen.com",       // Live www
  ];

  const origin = req.headers.origin || "";
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { session_id } = req.query;
    if (!session_id) return res.status(400).json({ error: "Missing session_id parameter" });

    // Retrieve the checkout session details
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["line_items.data.price.product"],
    });

    return res.status(200).json({
      id: session.id,
      amount_total: session.amount_total,
      currency: session.currency,
      line_items: session.line_items?.data || [],
      customer_email: session.customer_details?.email,
      payment_status: session.payment_status,
    });
  } catch (err) {
    console.error("Error fetching session details:", err);
    return res.status(400).json({ error: err.message });
  }
}
