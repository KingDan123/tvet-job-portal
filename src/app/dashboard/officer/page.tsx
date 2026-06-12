'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  totalGraduates: number;
  seekingEmployment: number;
  activePlacements: number;
  pendingReferrals: number;
  upcomingTrainingSessions: number;
  companiesEngaged: number;
}

export default function OfficerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalGraduates: 0,
    seekingEmployment: 0,
    activePlacements: 0,
    pendingReferrals: 0,
    upcomingTrainingSessions: 0,
    companiesEngaged: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'officer') {
      router.push('/');
      return;
    }

    setUser(parsedUser);
    fetchDashboardStats(token);
  }, [router]);

  const fetchDashboardStats = async (token: string) => {
    try {
      const response = await fetch('/api/officer/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

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
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">TV</span>
              </div>
              <div>
                <span className="text-xl font-bold">TVET Hub</span>
                <div className="text-xs text-gray-600">ILJC Officer Portal</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                👨‍💼 Officer
              </span>
              <span className="text-gray-600 text-sm">{user?.email}</span>
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1">
            <nav className="bg-white rounded-xl shadow-sm p-4 space-y-2 sticky top-8">
              <a
                href="/dashboard/officer"
                className="block px-4 py-3 bg-blue-50 text-blue-600 rounded-lg font-medium"
              >
                📊 Dashboard
              </a>
              <a
                href="/dashboard/officer/graduates"
                className="block px-4 py-3 hover:bg-gray-50 rounded-lg transition"
              >
                👥 Graduate Catalog (FLW-1)
              </a>
              <a
                href="/dashboard/officer/training"
                className="block px-4 py-3 hover:bg-gray-50 rounded-lg transition"
              >
                🎓 Training Sessions (FLW-3)
              </a>
              <a
                href="/dashboard/officer/employers"
                className="block px-4 py-3 hover:bg-gray-50 rounded-lg transition"
              >
                🏢 Employer CRM (FLW-4)
              </a>
              <a
                href="/dashboard/officer/referrals"
                className="block px-4 py-3 hover:bg-gray-50 rounded-lg transition"
              >
                📄 Referrals (FLW-5)
              </a>
              <a
                href="/dashboard/officer/matching"
                className="block px-4 py-3 hover:bg-gray-50 rounded-lg transition"
              >
                🎯 Smart Matching (FLW-6)
              </a>
              <a
                href="/dashboard/officer/placements"
                className="block px-4 py-3 hover:bg-gray-50 rounded-lg transition"
              >
                💼 Placements (FLW-9)
              </a>
              <a
                href="/dashboard/officer/reports"
                className="block px-4 py-3 hover:bg-gray-50 rounded-lg transition"
              >
                📈 Reports (FLW-10)
              </a>
            </nav>
          </aside>

          {/* Main Dashboard Content */}
          <main className="lg:col-span-3">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">ILJC Officer Dashboard</h1>
              <p className="text-gray-600">
                Employment Facilitation - OP-GWPTC-ILJC-002 Workflow Management
              </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-600">
                <div className="text-gray-600 text-sm mb-1">Total Graduates</div>
                <div className="text-3xl font-bold text-gray-900">{stats.totalGraduates}</div>
                <div className="text-xs text-gray-500 mt-1">In your institution</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-600">
                <div className="text-gray-600 text-sm mb-1">Seeking Employment</div>
                <div className="text-3xl font-bold text-green-600">{stats.seekingEmployment}</div>
                <div className="text-xs text-gray-500 mt-1">Ready for referrals</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-600">
                <div className="text-gray-600 text-sm mb-1">Active Placements</div>
                <div className="text-3xl font-bold text-purple-600">{stats.activePlacements}</div>
                <div className="text-xs text-gray-500 mt-1">Currently employed</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-600">
                <div className="text-gray-600 text-sm mb-1">Pending Referrals</div>
                <div className="text-3xl font-bold text-yellow-600">{stats.pendingReferrals}</div>
                <div className="text-xs text-gray-500 mt-1">Awaiting response</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-600">
                <div className="text-gray-600 text-sm mb-1">Training Sessions</div>
                <div className="text-3xl font-bold text-orange-600">{stats.upcomingTrainingSessions}</div>
                <div className="text-xs text-gray-500 mt-1">Upcoming this month</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-indigo-600">
                <div className="text-gray-600 text-sm mb-1">Companies Engaged</div>
                <div className="text-3xl font-bold text-indigo-600">{stats.companiesEngaged}</div>
                <div className="text-xs text-gray-500 mt-1">Active partnerships</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <a
                  href="/dashboard/officer/graduates"
                  className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition group"
                >
                  <div className="text-3xl">👥</div>
                  <div>
                    <div className="font-semibold group-hover:text-blue-600">View Graduates</div>
                    <div className="text-sm text-gray-600">FLW-1: Graduate Catalog</div>
                  </div>
                </a>

                <a
                  href="/dashboard/officer/training/create"
                  className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition group"
                >
                  <div className="text-3xl">➕</div>
                  <div>
                    <div className="font-semibold group-hover:text-green-600">Create Training</div>
                    <div className="text-sm text-gray-600">FLW-3: Schedule Session</div>
                  </div>
                </a>

                <a
                  href="/dashboard/officer/referrals/create"
                  className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition group"
                >
                  <div className="text-3xl">📄</div>
                  <div>
                    <div className="font-semibold group-hover:text-purple-600">New Referral</div>
                    <div className="text-sm text-gray-600">FLW-5: Generate Letter</div>
                  </div>
                </a>

                <a
                  href="/dashboard/officer/employers"
                  className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition group"
                >
                  <div className="text-3xl">🏢</div>
                  <div>
                    <div className="font-semibold group-hover:text-indigo-600">Manage Employers</div>
                    <div className="text-sm text-gray-600">FLW-4: CRM</div>
                  </div>
                </a>

                <a
                  href="/dashboard/officer/matching"
                  className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition group"
                >
                  <div className="text-3xl">🎯</div>
                  <div>
                    <div className="font-semibold group-hover:text-orange-600">Smart Matching</div>
                    <div className="text-sm text-gray-600">FLW-6: AI Recommendations</div>
                  </div>
                </a>

                <a
                  href="/dashboard/officer/reports"
                  className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-pink-500 hover:bg-pink-50 transition group"
                >
                  <div className="text-3xl">📊</div>
                  <div>
                    <div className="font-semibold group-hover:text-pink-600">Generate Report</div>
                    <div className="text-sm text-gray-600">FLW-10: Documentation</div>
                  </div>
                </a>
              </div>
            </div>

            {/* FLW Workflow Status */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">FLW Workflow Checklist</h2>
              <div className="space-y-3">
                {[
                  { step: 'FLW-1', title: 'List graduates by number & field', status: 'active' },
                  { step: 'FLW-2', title: 'Select graduates for employment', status: 'active' },
                  { step: 'FLW-3', title: 'Pre-employment training', status: 'active' },
                  { step: 'FLW-4', title: 'Build relationship with industry', status: 'active' },
                  { step: 'FLW-5', title: 'Refer graduates to industries', status: 'active' },
                  { step: 'FLW-6', title: 'Criteria GEP (matching)', status: 'active' },
                  { step: 'FLW-7', title: 'Prepare letters for employers', status: 'active' },
                  { step: 'FLW-8', title: 'Feedback from stakeholders', status: 'active' },
                  { step: 'FLW-9', title: 'Supervision of employed graduates', status: 'active' },
                  { step: 'FLW-10', title: 'Documentation & reporting', status: 'active' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-semibold text-sm">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.step}: {item.title}</div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      Ready
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
