'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CompanyDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'company') {
      router.push('/');
      return;
    }

    setUser(parsedUser);
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">TV</span>
              </div>
              <span className="text-xl font-bold">TVET Hub</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                Free Plan
              </span>
              <span className="text-gray-600">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <nav className="bg-white rounded-xl shadow-sm p-4 space-y-2">
              <a
                href="/dashboard/company"
                className="block px-4 py-3 bg-blue-50 text-blue-600 rounded-lg font-medium"
              >
                📊 Dashboard
              </a>
              <a
                href="/dashboard/company/jobs"
                className="block px-4 py-3 hover:bg-gray-50 rounded-lg transition"
              >
                💼 My Jobs
              </a>
              <a
                href="/dashboard/company/post-job"
                className="block px-4 py-3 hover:bg-gray-50 rounded-lg transition"
              >
                ➕ Post New Job
              </a>
              <a
                href="/dashboard/company/applications"
                className="block px-4 py-3 hover:bg-gray-50 rounded-lg transition"
              >
                📝 Applications
              </a>
              <a
                href="/dashboard/company/subscription"
                className="block px-4 py-3 hover:bg-gray-50 rounded-lg transition"
              >
                💳 Subscription
              </a>
            </nav>
          </aside>

          {/* Main Dashboard */}
          <main className="lg:col-span-2">
            <h1 className="text-3xl font-bold mb-6">Employer Dashboard</h1>

            {/* Upgrade Prompt */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white mb-8">
              <h2 className="text-2xl font-bold mb-2">Upgrade to Professional</h2>
              <p className="mb-4 opacity-90">
                Get unlimited job posts, advanced search, and direct messaging with candidates.
              </p>
              <div className="flex items-center space-x-4">
                <a
                  href="/dashboard/company/subscription"
                  className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition"
                >
                  View Plans - Starting at ETB 500/mo
                </a>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-gray-600 text-sm mb-1">Active Jobs</div>
                <div className="text-3xl font-bold text-blue-600">0</div>
                <div className="text-xs text-gray-500 mt-1">3 remaining on Free plan</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-gray-600 text-sm mb-1">Total Applications</div>
                <div className="text-3xl font-bold text-green-600">0</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-gray-600 text-sm mb-1">Candidates Hired</div>
                <div className="text-3xl font-bold text-purple-600">0</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a
                  href="/dashboard/company/post-job"
                  className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
                >
                  <div className="text-3xl">➕</div>
                  <div>
                    <div className="font-semibold">Post a New Job</div>
                    <div className="text-sm text-gray-600">Find qualified TVET graduates</div>
                  </div>
                </a>
                <a
                  href="/dashboard/company/browse-candidates"
                  className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
                >
                  <div className="text-3xl">🔍</div>
                  <div>
                    <div className="font-semibold">Browse Candidates</div>
                    <div className="text-sm text-gray-600">Search graduate profiles</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
              <div className="text-center py-8">
                <div className="text-gray-400 text-5xl mb-4">📊</div>
                <p className="text-gray-600">No recent activity</p>
                <p className="text-sm text-gray-500 mt-2">
                  Post your first job to start receiving applications
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
