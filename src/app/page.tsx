export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">TV</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">TVET Hub</span>
          </div>
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
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Connecting Ethiopia&apos;s <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-green-600">
            TVET Talent
          </span>{' '}
          with Opportunity
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          National job portal for Technical and Vocational Education and Training graduates.
          Find skilled workers or discover your next career opportunity.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <a href="/auth/register?role=trainee" className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg">
            I&apos;m a Graduate
          </a>
          <a href="/auth/register?role=company" className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition">
            I&apos;m Hiring
          </a>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'TVET Colleges', value: '200+' },
            { label: 'Active Graduates', value: '15,000+' },
            { label: 'Companies', value: '500+' },
            { label: 'Jobs Filled', value: '3,200+' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl p-6 shadow-md text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: '👤',
              title: 'Create Your Profile',
              desc: 'Build your professional profile with skills, certifications, and work preferences.',
            },
            {
              icon: '🔍',
              title: 'Smart Matching',
              desc: 'Our AI matches you with opportunities based on your field of study and skills.',
            },
            {
              icon: '💼',
              title: 'Get Hired',
              desc: 'Apply directly, get referrals from ILJC officers, and track your progress.',
            },
          ].map((feature, idx) => (
            <div key={idx} className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition">
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* For Companies */}
      <section className="bg-linear-to-r from-blue-600 to-green-600 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-4xl font-bold mb-6">For Employers</h2>
            <p className="text-xl mb-8 opacity-90">
              Access verified TVET graduates with skills that match your needs.
              Post jobs, review candidates, and hire faster.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {['Free tier with 3 job posts', 'Verified graduate profiles', 'Smart candidate matching'].map((point, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <div className="text-lg">✓ {point}</div>
                </div>
              ))}
            </div>
            <a href="/pricing" className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg">
              View Pricing Plans
            </a>
          </div>
        </div>
      </section>

      {/* Language Support */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-6">Available in Multiple Languages</h2>
        <div className="flex justify-center space-x-8 text-2xl">
          <span className="px-6 py-3 bg-gray-100 rounded-lg">English</span>
          <span className="px-6 py-3 bg-gray-100 rounded-lg">አማርኛ (Amharic)</span>
          <span className="px-6 py-3 bg-gray-100 rounded-lg">Afaan Oromo</span>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold mb-4">TVET Hub</div>
              <p className="text-gray-400">
                Empowering Ethiopia&apos;s technical workforce through better job connections.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Graduates</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/jobs" className="hover:text-white transition">Browse Jobs</a></li>
                <li><a href="/training" className="hover:text-white transition">Training Sessions</a></li>
                <li><a href="/support" className="hover:text-white transition">Get Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Employers</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="/post-job" className="hover:text-white transition">Post a Job</a></li>
                <li><a href="/contact" className="hover:text-white transition">Contact Sales</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">About</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/about" className="hover:text-white transition">About GWPTC</a></li>
                <li><a href="/privacy" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-white transition">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2026 TVET Hub - General Wingate Polytechnic College. All rights reserved.</p>
            <p className="mt-2 text-sm">OP-GWPTC-ILJC-002 Compliant Employment Facilitation System</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
