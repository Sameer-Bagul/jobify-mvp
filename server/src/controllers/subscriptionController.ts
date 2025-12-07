import { Response } from "express";
import { Subscription, UserProfile, ActivityLog } from "../models/index.js";
import { AuthRequest } from "../middleware/auth.js";
import { createOrder, verifyPaymentSignature, getRazorpayKeyId } from "../utils/razorpay.js";
import { PLAN_CONFIGS, PlanTier } from "../models/Subscription.js";

const SUBSCRIPTION_CURRENCY = "INR";

export const getSubscriptionStatus = async (req: AuthRequest, res: Response) => {
  try {
    const subscription = await Subscription.findOne({
      userId: req.userId,
      status: "active",
      endDate: { $gte: new Date() },
    }).sort({ endDate: -1 });

    if (!subscription) {
      return res.json({
        isSubscribed: false,
        subscription: null,
      });
    }

    res.json({
      isSubscribed: true,
      subscription: {
        planName: subscription.planName,
        planTier: subscription.planTier,
        dailyEmailLimit: subscription.dailyEmailLimit,
        amount: subscription.amount,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        daysRemaining: Math.ceil(
          (subscription.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        ),
      },
    });
  } catch (error) {
    console.error("Get subscription status error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createSubscriptionOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { planTier = "pro" } = req.body;
    
    if (!["pro", "pro_plus", "pro_max"].includes(planTier)) {
      return res.status(400).json({ error: "Invalid plan tier" });
    }

    const planConfig = PLAN_CONFIGS[planTier as PlanTier];
    const receipt = `sub_${req.userId}_${Date.now()}`;

    const result = await createOrder({
      amount: planConfig.price,
      currency: SUBSCRIPTION_CURRENCY,
      receipt,
      notes: {
        userId: req.userId!.toString(),
        type: "subscription",
        planTier,
      },
    });

    if (!result.success || !result.order) {
      return res.status(500).json({ error: result.error || "Failed to create order" });
    }

    const subscription = await Subscription.create({
      userId: req.userId,
      planName: planConfig.name,
      planTier: planTier as PlanTier,
      dailyEmailLimit: planConfig.dailyEmailLimit,
      amount: planConfig.price,
      currency: SUBSCRIPTION_CURRENCY,
      status: "pending",
      razorpayOrderId: result.order.id,
    });

    res.json({
      orderId: result.order.id,
      amount: result.order.amount,
      currency: result.order.currency,
      keyId: getRazorpayKeyId(),
      subscriptionId: subscription._id,
      planName: planConfig.name,
      planTier,
    });
  } catch (error) {
    console.error("Create subscription order error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const verifySubscriptionPayment = async (req: AuthRequest, res: Response) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing payment details" });
    }

    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      const subscription = await Subscription.findOne({
        razorpayOrderId: razorpay_order_id,
      });
      if (subscription) {
        subscription.status = "failed";
        await subscription.save();
      }
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    const subscription = await Subscription.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    subscription.status = "active";
    subscription.razorpayPaymentId = razorpay_payment_id;
    subscription.razorpaySignature = razorpay_signature;
    subscription.startDate = startDate;
    subscription.endDate = endDate;
    await subscription.save();

    await ActivityLog.create({
      userId: req.userId,
      action: "Subscription activated",
      actionType: "subscription_changed",
      details: {
        planName: subscription.planName,
        amount: subscription.amount,
        endDate,
      },
    });

    res.json({
      message: "Payment verified and subscription activated",
      subscription: {
        planName: subscription.planName,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
      },
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getSubscriptionHistory = async (req: AuthRequest, res: Response) => {
  try {
    const subscriptions = await Subscription.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ subscriptions });
  } catch (error) {
    console.error("Get subscription history error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const checkSubscriptionRequired = async (req: AuthRequest, res: Response, next: Function) => {
  try {
    const subscription = await Subscription.findOne({
      userId: req.userId,
      status: "active",
      endDate: { $gte: new Date() },
    });

    if (!subscription) {
      return res.status(403).json({
        error: "Subscription required",
        message: "Please subscribe to use this feature",
        requiresSubscription: true,
      });
    }

    next();
  } catch (error) {
    console.error("Check subscription error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAvailablePlans = async (_req: AuthRequest, res: Response) => {
  try {
    const plans = Object.values(PLAN_CONFIGS).map(plan => ({
      tier: plan.tier,
      name: plan.name,
      price: plan.price,
      dailyEmailLimit: plan.dailyEmailLimit,
      features: plan.features,
    }));

    res.json({ plans });
  } catch (error) {
    console.error("Get available plans error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
