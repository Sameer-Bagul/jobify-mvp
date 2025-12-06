import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { CreditCard, Check, Zap, Mail, Sparkles, Crown, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface SubscriptionStatus {
  isSubscribed: boolean;
  plan: string;
  emailsRemaining: number;
  dailyLimit: number;
  expiresAt?: string;
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

const plans = [
  {
    name: 'Free',
    price: 0,
    period: '',
    features: [
      '20 cold emails per day',
      'Basic job matching',
      'Email templates',
      'Job search & filters',
    ],
    icon: Mail,
    color: 'gray',
    current: true,
  },
  {
    name: 'Pro',
    price: 499,
    period: '/month',
    features: [
      '100 cold emails per day',
      'AI-powered job matching',
      'Custom email templates',
      'Priority job listings',
      'Resume builder',
      'Analytics dashboard',
    ],
    icon: Zap,
    color: 'purple',
    popular: true,
  },
  {
    name: 'Premium',
    price: 999,
    period: '/month',
    features: [
      'Unlimited cold emails',
      'Advanced AI matching',
      'All Pro features',
      'Dedicated support',
      'Early access to jobs',
      'Company insights',
    ],
    icon: Crown,
    color: 'blue',
  },
];

export default function Subscription() {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
    loadRazorpayScript();
  }, []);

  const loadRazorpayScript = () => {
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

  const handleSubscribe = async (planName: string, amount: number) => {
    if (planName === 'Free') return;
    
    setPurchasing(planName);
    
    try {
      const orderRes = await api.post('/subscription/create-order', {
        plan: planName.toLowerCase(),
        amount: amount * 100,
      });

      const options: RazorpayOptions = {
        key: orderRes.data.keyId,
        amount: orderRes.data.amount,
        currency: orderRes.data.currency,
        name: 'Jobify',
        description: `${planName} Subscription`,
        order_id: orderRes.data.orderId,
        handler: async (response: RazorpayResponse) => {
          try {
            await api.post('/subscription/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: planName.toLowerCase(),
            });
            fetchStatus();
          } catch (err) {
            console.error('Payment verification failed:', err);
          }
        },
        theme: { color: '#9333ea' },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error('Failed to create order:', err);
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <Layout role="seeker">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-600/10 border border-purple-500/20 text-purple-400 text-sm mb-6">
            <Sparkles className="h-4 w-4" />
            Upgrade your job search
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Choose Your Plan</h1>
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
            {status?.isSubscribed && (
              <div className="mb-8 p-6 card bg-gradient-to-r from-purple-600/10 to-blue-600/10 border-purple-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      Current Plan: {status.plan}
                    </h3>
                    <p className="text-gray-400">
                      {status.emailsRemaining} emails remaining today (Daily limit: {status.dailyLimit})
                    </p>
                    {status.expiresAt && (
                      <p className="text-sm text-gray-500 mt-1">
                        Expires: {new Date(status.expiresAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Crown className="h-10 w-10 text-purple-400" />
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const Icon = plan.icon;
                const isCurrentPlan = status?.plan?.toLowerCase() === plan.name.toLowerCase();
                
                return (
                  <div
                    key={plan.name}
                    className={`card relative ${
                      plan.popular ? 'border-purple-500/50 ring-2 ring-purple-500/20' : ''
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-xs font-medium text-white">
                        Most Popular
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <div className={`w-14 h-14 rounded-xl bg-${plan.color}-600/20 flex items-center justify-center mx-auto mb-4`}>
                        <Icon className={`h-7 w-7 text-${plan.color}-400`} />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                      <div className="flex items-end justify-center gap-1">
                        <span className="text-4xl font-bold text-white">
                          {plan.price === 0 ? 'Free' : `₹${plan.price}`}
                        </span>
                        {plan.period && (
                          <span className="text-gray-400 mb-1">{plan.period}</span>
                        )}
                      </div>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3 text-gray-300">
                          <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleSubscribe(plan.name, plan.price)}
                      disabled={isCurrentPlan || plan.price === 0 || purchasing === plan.name}
                      className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                        isCurrentPlan
                          ? 'bg-dark-700 text-gray-500 cursor-not-allowed'
                          : plan.popular
                          ? 'btn-primary'
                          : 'bg-dark-700 text-white hover:bg-dark-600'
                      }`}
                    >
                      {purchasing === plan.name ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : isCurrentPlan ? (
                        'Current Plan'
                      ) : plan.price === 0 ? (
                        'Current Plan'
                      ) : (
                        <>
                          <CreditCard className="h-5 w-5" />
                          Subscribe
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 text-center">
              <p className="text-gray-400">
                All plans include secure payment processing via Razorpay.
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
