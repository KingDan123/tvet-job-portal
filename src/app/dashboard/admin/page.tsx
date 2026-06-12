'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AdminStats {
  totalUsers: number;
  totalGraduates: number;
  totalCompanies: number;
  totalJobs: number;
  totalApplications: number;
  totalPlacements: number;
  placementRate: number;
  activeOfficers: number;
  revenueThisMonth: number;
  mrr: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalGraduates: 0,
    totalCompanies: 0,
    totalJobs: 0,
    totalApplications: 0,
    totalPlacements: 0,
    placementRate: 0,
    activeOfficers: 0,
    revenueThisMonth: 0,
    mrr: 0,
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
    if (parsedUser.role !== 'admin') {
      router.push('/');
      return;
    }

    setUser(parsedUser);
    fetchAdminStats(token);
  }, [router]);

  const fetchAdminStats = async (token: string) => {
    try {
      const response = await fetch('/api/admin/dashboard/stats', {
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
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">TV</span>
              </div>
              <div>
                <span className="text-xl font-bold">TVET Hub</span>
                <div className="text-xs text-gray-600">Admin Portal</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                🔧 Admin
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
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <nav className="bg-white rounded-xl shadow-sm p-4 space-y-2 sticky top-8">
              <a
                href="/dashboard/admin"
                className="block px-4 py-3 bg-purple-50 text-purple-600 rounded-lg font-medium"
              >
                📊 Dashboard
              </a>
              <a
                href="/dashboard/admin/users"
                className="block px-4 py-3 hover:bg-gray-50 rounded-lg transition"
              >
                👥 User Management
              </a>
              <a
                href="/dashboard/admin/companies"
                className="block px-4 py-3 hover:bg-gray-50 rounded-lg transition"
              >
                🏢 Company Verification
              </a>
              <a
                href="/dashboard/admin/analytics"
                className="block px-4 py-3 hover:bg-gray-50 rounded-lg transition"
              >
                📈 Analytics
              </a>
              <a
                href="/dashboard/admin/institutions"
                className="block px-4 py-3 hover:bg-gray-50 rounded-lg transition"
              >
                🏛️ Institutions
              </a>
              <a
                href="/dashboard/admin/revenue"
                className="block px-4 py-3 hover:bg-gray-50 rounded-lg transition"
              >
                💰 Revenue
              </a>
              <a
                href="/dashboard/admin/tracer"
                className="block px-4 py-3 hover:bg-gray-50 rounded-lg transition"
              >
                📋 Tracer Studies
              </a>
              <a
                href="/dashboard/admin/audit"
                className="block px-4 py-3 hover:bg-gray-50 rounded-lg transition"
              >
                🔍 Audit Log
              </a>
              <a
                href="/dashboard/admin/settings"
                className="block px-4 py-3 hover:bg-gray-50 rounded-lg transition"
              >
                ⚙️ Settings
              </a>
            </nav>
          </aside>

          {/* Main Dashboard */}
          <main className="lg:col-span-3">
            <h1 className="text-3xl font-bold mb-6">System Overview</h1>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-600">
                <div className="text-gray-600 text-sm mb-1">Total Users</div>
                <div className="text-3xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</div>
                <div className="text-xs text-gray-500 mt-1">All roles</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-600">
                <div className="text-gray-600 text-sm mb-1">TVET Graduates</div>
                <div className="text-3xl font-bold text-green-600">{stats.totalGraduates.toLocaleString()}</div>
                <div className="text-xs text-gray-500 mt-1">Registered trainees</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-600">
                <div className="text-gray-600 text-sm mb-1">Companies</div>
                <div className="text-3xl font-bold text-purple-600">{stats.totalCompanies.toLocaleString()}</div>
                <div className="text-xs text-gray-500 mt-1">Employers on platform</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-600">
                <div className="text-gray-600 text-sm mb-1">Active Jobs</div>
                <div className="text-3xl font-bold text-yellow-600">{stats.totalJobs.toLocaleString()}</div>
                <div className="text-xs text-gray-500 mt-1">Open positions</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-600">
                <div className="text-gray-600 text-sm mb-1">Applications</div>
                <div className="text-3xl font-bold text-orange-600">{stats.totalApplications.toLocaleString()}</div>
                <div className="text-xs text-gray-500 mt-1">Total submissions</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-pink-600">
                <div className="text-gray-600 text-sm mb-1">Placements</div>
                <div className="text-3xl font-bold text-pink-600">{stats.totalPlacements.toLocaleString()}</div>
                <div className="text-xs text-gray-500 mt-1">Successful hires</div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl shadow-lg p-6 text-white">
                <h3 className="text-lg font-semibold mb-4">Placement Rate</h3>
                <div className="text-5xl font-bold mb-2">{stats.placementRate}%</div>
                <div className="text-sm opacity-90">
                  {stats.totalPlacements} out of {stats.totalGraduates} graduates employed
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg p-6 text-white">
                <h3 className="text-lg font-semibold mb-4">Monthly Recurring Revenue</h3>
                <div className="text-5xl font-bold mb-2">ETB {stats.mrr.toLocaleString()}</div>
                <div className="text-sm opacity-90">
                  +ETB {stats.revenueThisMonth.toLocaleString()} this month
                </div>
              </div>
            </div>

            {/* System Health */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">System Health</h2>
              <div className="space-y-4">
                {[
                  { label: 'Database', status: 'Operational', color: 'green' },
                  { label: 'API Services', status: 'Operational', color: 'green' },
                  { label: 'File Storage', status: 'Operational', color: 'green' },
                  { label: 'Email Service', status: 'Pending Setup', color: 'yellow' },
                  { label: 'SMS Service', status: 'Pending Setup', color: 'yellow' },
                  { label: 'Payment Gateway', status: 'Pending Setup', color: 'yellow' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{item.label}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.color === 'green'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <a
                  href="/dashboard/admin/companies"
                  className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition"
                >
                  <div className="text-3xl">✅</div>
                  <div>
                    <div className="font-semibold">Verify Companies</div>
                    <div className="text-sm text-gray-600">Review pending requests</div>
                  </div>
                </a>

                <a
                  href="/dashboard/admin/analytics"
                  className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition"
                >
                  <div className="text-3xl">📊</div>
                  <div>
                    <div className="font-semibold">View Analytics</div>
                    <div className="text-sm text-gray-600">Detailed insights</div>
                  </div>
                </a>

                <a
                  href="/dashboard/admin/tracer"
                  className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition"
                >
                  <div className="text-3xl">📋</div>
                  <div>
                    <div className="font-semibold">Create Survey</div>
                    <div className="text-sm text-gray-600">Tracer study</div>
                  </div>
                </a>

                <a
                  href="/dashboard/admin/users"
                  className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition"
                >
                  <div className="text-3xl">👥</div>
                  <div>
                    <div className="font-semibold">Manage Users</div>
                    <div className="text-sm text-gray-600">View all users</div>
                  </div>
                </a>

                <a
                  href="/dashboard/admin/revenue"
                  className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition"
                >
                  <div className="text-3xl">💰</div>
                  <div>
                    <div className="font-semibold">Revenue Report</div>
                    <div className="text-sm text-gray-600">Financial overview</div>
                  </div>
                </a>

                <a
                  href="/dashboard/admin/audit"
                  className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition"
                >
                  <div className="text-3xl">🔍</div>
                  <div>
                    <div className="font-semibold">Audit Log</div>
                    <div className="text-sm text-gray-600">System activity</div>
                  </div>
                </a>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
