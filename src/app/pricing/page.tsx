export default function PricingPage() {
  const plans = [
    {
      name: 'Free',
      price: '0',
      description: 'Perfect for small businesses testing the platform',
      features: [
        '3 active job posts',
        'Basic candidate search',
        'Email notifications',
        'Community support',
        'Access to verified graduates',
      ],
      limitations: [
        'No direct messaging',
        'No analytics',
        'No advanced filters',
      ],
      cta: 'Get Started',
      href: '/auth/register?role=company',
      highlighted: false,
    },
    {
      name: 'Professional',
      price: '500',
      description: 'For growing companies serious about hiring',
      features: [
        'Unlimited job posts',
        'Advanced candidate search',
        'Direct messaging with candidates',
        'Verified Employer badge',
        'Email & SMS notifications',
        'Priority support',
        'Export candidate lists',
      ],
      limitations: [],
      cta: 'Start Free Trial',
      href: '/auth/register?role=company',
      highlighted: true,
    },
    {
      name: 'Business',
      price: '1,500',
      description: 'For established companies with high hiring needs',
      features: [
        'Everything in Professional',
        'Hiring analytics dashboard',
        'Time-to-hire metrics',
        'Retention rate tracking',
        'Bulk candidate export',
        'Custom job templates',
        'Dedicated account manager',
        'API access (beta)',
      ],
      limitations: [],
      cta: 'Contact Sales',
      href: '/contact',
      highlighted: false,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large organizations and government agencies',
      features: [
        'Everything in Business',
        'Custom integrations',
        'Full API access',
        'White-label options',
        'Multi-location support',
        'Custom SLA',
        'On-premise deployment option',
        'Free for MoE/Government',
      ],
      limitations: [],
      cta: 'Contact Us',
      href: '/contact',
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <a href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">TV</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">TVET Hub</span>
          </a>
          <div className="flex items-center space-x-4">
            <a href="/auth/login" className="text-gray-700 hover:text-blue-600 transition">
              Sign In
            </a>
            <a href="/auth/register" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Get Started
            </a>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Choose the plan that fits your hiring needs. All plans include access to verified TVET graduates.
        </p>
        <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
          <span className="text-2xl">🎉</span>
          <span className="font-medium">20% off annual plans</span>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-2xl shadow-lg p-8 relative ${
                plan.highlighted ? 'ring-2 ring-blue-600 scale-105' : ''
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full">
                  Most Popular
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-2">
                  {plan.price === 'Custom' ? (
                    <div className="text-3xl font-bold text-gray-900">Custom</div>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-gray-900">ETB {plan.price}</span>
                      {plan.price !== '0' && <span className="text-gray-600">/month</span>}
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-600">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start text-sm">
                    <span className="text-green-600 mr-2">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
                {plan.limitations.map((limitation, i) => (
                  <li key={i} className="flex items-start text-sm">
                    <span className="text-gray-400 mr-2">✗</span>
                    <span className="text-gray-400">{limitation}</span>
                  </li>
                ))}
              </ul>

              <a
                href={plan.href}
                className={`block w-full py-3 text-center rounded-lg font-semibold transition ${
                  plan.highlighted
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Calculate Your ROI</h2>
            <p className="text-gray-600 mb-8">
              Average cost-per-hire in Ethiopia is ETB 3,000-15,000. With TVET Hub Professional at ETB 500/month,
              you break even after just 1 hire per month.
            </p>
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">6-12 weeks</div>
                  <div className="text-sm text-gray-600">Traditional hiring time</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-2">1-3 weeks</div>
                  <div className="text-sm text-gray-600">With TVET Hub</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">70%</div>
                  <div className="text-sm text-gray-600">Time saved</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto space-y-6">
          {[
            {
              q: 'Can I switch plans later?',
              a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.',
            },
            {
              q: 'Do you offer discounts for NGOs?',
              a: 'Yes, registered NGOs and social enterprises receive 80% off any paid plan.',
            },
            {
              q: 'What payment methods do you accept?',
              a: 'We accept Telebirr, CBE Birr, HelloCash, and all major cards through Chapa payment gateway.',
            },
            {
              q: 'Is there a free trial?',
              a: 'The Free plan is available forever. Professional and Business plans offer a 14-day free trial.',
            },
            {
              q: 'What happens if I exceed my job post limit?',
              a: 'On the Free plan (3 jobs), you\'ll need to close an existing job or upgrade to post more.',
            },
          ].map((faq, idx) => (
            <details key={idx} className="bg-white rounded-xl p-6 shadow-sm">
              <summary className="font-semibold text-lg cursor-pointer">{faq.q}</summary>
              <p className="mt-3 text-gray-600">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-green-600 py-20">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Find Great Talent?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of Ethiopian companies hiring TVET graduates.
          </p>
          <a
            href="/auth/register?role=company"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg"
          >
            Get Started Free
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>© 2026 TVET Hub - General Wingate Polytechnic College</p>
        </div>
      </footer>
    </div>
  );
}
