import Razorpay from "razorpay";
import crypto from "crypto";

let razorpayInstance: Razorpay | null = null;

function getRazorpayInstance(): Razorpay | null {
  if (razorpayInstance) return razorpayInstance;
  
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  
  if (!keyId || !keySecret) {
    console.warn("WARNING: Razorpay credentials not configured. Payment features will be unavailable.");
    return null;
  }
  
  razorpayInstance = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
  
  return razorpayInstance;
}

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
    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      return {
        success: false,
        error: "Payment gateway not configured. Please contact support.",
      };
    }
    
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
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error("Razorpay secret not configured");
      return false;
    }
    
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
    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      return { success: false, error: "Payment gateway not configured" };
    }
    
    const payment = await razorpay.payments.fetch(paymentId);
    return { success: true, payment };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function refundPayment(paymentId: string, amount?: number) {
  try {
    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      return { success: false, error: "Payment gateway not configured" };
    }
    
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

export function isRazorpayConfigured(): boolean {
  return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}
