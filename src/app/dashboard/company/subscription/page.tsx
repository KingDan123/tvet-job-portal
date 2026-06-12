'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface SubscriptionInfo {
  currentTier: string;
  expiresAt: string | null;
  isActive: boolean;
  activeJobs: number;
  remainingSlots: number | null;
}

export default function SubscriptionPage() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetchSubscription(token);
  }, [router]);

  const fetchSubscription = async (token: string) => {
    try {
      const response = await fetch('/api/companies/subscription', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setSubscription(data.data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (tier: string, price: number) => {
    if (confirm(`Upgrade to ${tier} plan for ETB ${price}/month?`)) {
      alert('Payment integration coming soon! This will redirect to Chapa payment gateway.');
      // TODO: Initialize Chapa payment
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const plans = [
    {
      tier: 'free',
      name: 'Free',
      price: 0,
      features: [
        '3 active job posts',
        'Basic candidate search',
        'Email notifications',
        'Community support',
      ],
      limitations: ['No direct messaging', 'No analytics'],
    },
    {
      tier: 'professional',
      name: 'Professional',
      price: 500,
      features: [
        'Unlimited job posts',
        'Advanced candidate search',
        'Direct messaging',
        'Verified Employer badge',
        'Priority support',
      ],
      popular: true,
    },
    {
      tier: 'business',
      name: 'Business',
      price: 1500,
      features: [
        'Everything in Professional',
        'Hiring analytics dashboard',
        'Bulk candidate export',
        'Custom job templates',
        'Dedicated account manager',
      ],
    },
    {
      tier: 'enterprise',
      name: 'Enterprise',
      price: 5000,
      features: [
        'Everything in Business',
        'Custom integrations',
        'API access',
        'White-label options',
        'Custom SLA',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <a href="/dashboard/company" className="text-gray-600 hover:text-gray-900">
              ← Back
            </a>
            <div className="w-1 h-6 bg-gray-300"></div>
            <h1 className="text-xl font-bold">Subscription Management</h1>
          </div>
        </div>
      </header>

      {/* Current Plan */}
      {subscription && (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white mb-8">
            <h2 className="text-2xl font-bold mb-2">Current Plan: {subscription.currentTier}</h2>
            <p className="opacity-90">
              {subscription.remainingSlots === null
                ? 'Unlimited job posts'
                : `${subscription.remainingSlots} job slots remaining`}
            </p>
            {subscription.expiresAt && (
              <p className="text-sm opacity-75 mt-2">
                {subscription.isActive ? 'Renews' : 'Expired'} on{' '}
                {new Date(subscription.expiresAt).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.tier}
                className={`bg-white rounded-xl shadow-lg p-6 relative ${
                  plan.popular ? 'ring-2 ring-blue-600' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full">
                    Most Popular
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    {plan.price === 0 ? (
                      <span className="text-4xl font-bold text-gray-900">Free</span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold text-gray-900">ETB {plan.price}</span>
                        <span className="text-gray-600">/month</span>
                      </>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start text-sm">
                      <span className="text-green-600 mr-2">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                  {plan.limitations?.map((limitation, i) => (
                    <li key={i} className="flex items-start text-sm text-gray-400">
                      <span className="mr-2">✗</span>
                      <span>{limitation}</span>
                    </li>
                  ))}
                </ul>

                {subscription.currentTier === plan.tier ? (
                  <button
                    disabled
                    className="w-full py-3 bg-gray-100 text-gray-500 rounded-lg font-semibold cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.name, plan.price)}
                    className={`w-full py-3 rounded-lg font-semibold transition ${
                      plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {plan.price === 0 ? 'Downgrade' : 'Upgrade'}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* ROI Calculator */}
          <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
            <h3 className="text-xl font-bold mb-4">Return on Investment</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">ETB 3,000-15,000</div>
                <div className="text-sm text-gray-600">Average cost per hire (traditional)</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">ETB 500-1,500</div>
                <div className="text-sm text-gray-600">Monthly subscription cost</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-2">1 hire</div>
                <div className="text-sm text-gray-600">To break even per month</div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
            <h3 className="text-xl font-bold mb-4">Frequently Asked Questions</h3>
            <div className="space-y-4">
              {[
                {
                  q: 'Can I cancel anytime?',
                  a: 'Yes, you can cancel your subscription at any time. Your access continues until the end of the billing period.',
                },
                {
                  q: 'What payment methods do you accept?',
                  a: 'We accept Telebirr, CBE Birr, HelloCash, and all major cards through Chapa payment gateway.',
                },
                {
                  q: 'Do you offer refunds?',
                  a: 'We offer a 7-day money-back guarantee if you\'re not satisfied with our service.',
                },
              ].map((faq, idx) => (
                <div key={idx} className="border-b border-gray-200 pb-4 last:border-0">
                  <div className="font-semibold mb-2">{faq.q}</div>
                  <div className="text-sm text-gray-600">{faq.a}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
