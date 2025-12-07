import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { CreditCard, Check, Sparkles, Crown, Loader2, Briefcase, Mail } from 'lucide-react';
import api from '@/lib/api';

interface SubscriptionData {
  planName: string;
  amount: number;
  startDate: string;
  endDate: string;
  daysRemaining: number;
}

interface SubscriptionStatus {
  isSubscribed: boolean;
  subscription: SubscriptionData | null;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  theme: { color: string };
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

const PLAN_PRICE = 500;
const PLAN_FEATURES = [
  'Access to all job listings',
  '20 cold emails per day',
  'AI-powered job matching',
  'Custom email templates',
  'Priority job listings',
  'Resume builder',
  'Analytics dashboard',
];

export default function Subscription() {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
    loadRazorpayScript();
  }, []);

  const loadRazorpayScript = () => {
    if (document.querySelector('script[src*="razorpay"]')) return;
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  };

  const fetchStatus = async () => {
    try {
      const res = await api.get('/subscription/status');
      setStatus(res.data);
    } catch (err) {
      console.error('Failed to fetch subscription status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    setPurchasing(true);
    setError(null);
    
    try {
      const orderRes = await api.post('/subscription/create-order', {});

      if (!orderRes.data.keyId) {
        setError('Payment gateway not configured. Please contact support.');
        setPurchasing(false);
        return;
      }

      const options: RazorpayOptions = {
        key: orderRes.data.keyId,
        amount: orderRes.data.amount,
        currency: orderRes.data.currency,
        name: 'Jobify',
        description: 'Pro Monthly Subscription',
        order_id: orderRes.data.orderId,
        handler: async (response: RazorpayResponse) => {
          try {
            await api.post('/subscription/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            fetchStatus();
          } catch (err) {
            console.error('Payment verification failed:', err);
            setError('Payment verification failed. Please contact support.');
          }
        },
        theme: { color: '#9333ea' },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      console.error('Failed to create order:', err);
      setError(err.response?.data?.error || 'Failed to initiate payment. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-600/10 border border-purple-500/20 text-purple-400 text-sm mb-6">
            <Sparkles className="h-4 w-4" />
            Upgrade your job search
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Pro Subscription</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Unlock powerful features to supercharge your job search and stand out from the crowd
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          </div>
        ) : (
          <>
            {status?.isSubscribed && status.subscription && (
              <div className="mb-8 p-6 card bg-gradient-to-r from-purple-600/10 to-blue-600/10 border-purple-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      You're Subscribed!
                    </h3>
                    <p className="text-gray-400">
                      Plan: {status.subscription.planName}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {status.subscription.daysRemaining} days remaining - Expires: {new Date(status.subscription.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Crown className="h-10 w-10 text-purple-400" />
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-600/10 border border-red-500/20 rounded-lg text-red-400 text-center">
                {error}
              </div>
            )}

            <div className="card border-purple-500/50 ring-2 ring-purple-500/20 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-xs font-medium text-white">
                Recommended
              </div>

              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-xl bg-purple-600/20 flex items-center justify-center mx-auto mb-4">
                  <Crown className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Pro Monthly</h3>
                <div className="flex items-end justify-center gap-1">
                  <span className="text-5xl font-bold text-white">₹{PLAN_PRICE}</span>
                  <span className="text-gray-400 mb-2">/month</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 p-3 bg-dark-700/50 rounded-lg">
                  <Briefcase className="h-5 w-5 text-purple-400" />
                  <span className="text-gray-300">Job Listings Access</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-dark-700/50 rounded-lg">
                  <Mail className="h-5 w-5 text-purple-400" />
                  <span className="text-gray-300">20 Emails/Day</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {PLAN_FEATURES.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={handleSubscribe}
                disabled={status?.isSubscribed || purchasing}
                className={`w-full py-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-lg ${
                  status?.isSubscribed
                    ? 'bg-dark-700 text-gray-500 cursor-not-allowed'
                    : 'btn-primary'
                }`}
              >
                {purchasing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : status?.isSubscribed ? (
                  'Already Subscribed'
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    Subscribe Now
                  </>
                )}
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-400">
                Secure payment processing via Razorpay.
                <br />
                Cancel anytime. No hidden fees.
              </p>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
