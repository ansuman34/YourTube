import crypto from "crypto";
import User from "../Modals/Auth.js";

export const createOrder = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({ message: "Payment provider is not configured" });
    }

    let Razorpay;
    try {
      const module = await import("razorpay");
      Razorpay = module.default;
    } catch {
      return res.status(503).json({ message: "Razorpay package is not installed" });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: 10000, // Amount in paise (100 INR)
      currency: "INR",
      receipt: `receipt_${userId}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } = req.body;

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({ message: "Payment provider is not configured" });
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      const user = await User.findById(userId);
      if (user) {
        user.isPremium = true;
        await user.save();
      }
      res.status(200).json({ message: "Payment verified successfully" });
    } else {
      res.status(400).json({ message: "Payment verification failed" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
