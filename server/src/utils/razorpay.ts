import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export interface OrderOptions {
  amount: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface CreateOrderResult {
  success: boolean;
  order?: any;
  error?: string;
}

export async function createOrder(options: OrderOptions): Promise<CreateOrderResult> {
  try {
    const order = await razorpay.orders.create({
      amount: options.amount * 100,
      currency: options.currency || "INR",
      receipt: options.receipt,
      notes: options.notes || {},
    });

    return {
      success: true,
      order,
    };
  } catch (error: any) {
    console.error("Razorpay order creation error:", error);
    return {
      success: false,
      error: error.message || "Failed to create order",
    };
  }
}

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  try {
    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    const body = orderId + "|" + paymentId;
    
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    return expectedSignature === signature;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

export async function fetchPayment(paymentId: string) {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return { success: true, payment };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function refundPayment(paymentId: string, amount?: number) {
  try {
    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount ? amount * 100 : undefined,
    });
    return { success: true, refund };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export function getRazorpayKeyId(): string {
  return process.env.RAZORPAY_KEY_ID || "";
}
