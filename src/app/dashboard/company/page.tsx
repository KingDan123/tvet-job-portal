'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface CompanyStats {
  activeJobs: number;
  totalApplications: number;
  pendingReview: number;
  shortlisted: number;
  hired: number;
  tier: string;
}

export default function CompanyDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<CompanyStats>({
    activeJobs: 0,
    totalApplications: 0,
    pendingReview: 0,
    shortlisted: 0,
    hired: 0,
    tier: 'free'
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
    if (parsedUser.role !== 'company') {
      router.push('/');
      return;
    }

    setUser(parsedUser);
    fetchStats(token);
  }, [router]);

  const fetchStats = async (token: string) => {
    try {
      const response = await fetch('/api/companies/stats', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading portal...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">TV</div>
            <span className="text-xl font-bold">Employer Portal</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase">{stats.tier} Plan</span>
            <span className="text-gray-600 font-medium">{user?.email}</span>
            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-600">Logout</button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="space-y-2">
            <nav className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <a href="/dashboard/company" className="block px-4 py-3 bg-blue-50 text-blue-600 rounded-lg font-bold">📊 Dashboard</a>
              <a href="/dashboard/company/jobs" className="block px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">💼 Job Postings</a>
              <a href="/dashboard/company/post-job" className="block px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">➕ Post a Job</a>
              <a href="/dashboard/company/profile" className="block px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">⚙️ Settings</a>
              <a href="/dashboard/company/subscription" className="block px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">💳 Billing</a>
            </nav>
          </aside>

          <main className="lg:col-span-3 space-y-8">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Welcome Back!</h1>
                <p className="text-gray-500">Manage your recruitment pipeline and find top TVET talent.</p>
              </div>
              <button onClick={() => router.push('/dashboard/company/post-job')} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition">
                Create New Listing
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Active Jobs', val: stats.activeJobs, color: 'blue' },
                { label: 'Applications', val: stats.totalApplications, color: 'purple' },
                { label: 'Shortlisted', val: stats.shortlisted, color: 'yellow' },
                { label: 'Hired', val: stats.hired, color: 'green' },
              ].map((item, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="text-sm font-bold text-gray-500 uppercase">{item.label}</div>
                  <div className={`text-4xl font-black text-${item.color}-600 mt-2`}>{item.val}</div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold">Recruitment Funnel</h2>
                <a href="/dashboard/company/jobs" className="text-blue-600 text-sm font-bold hover:underline">View All Jobs →</a>
              </div>
              <div className="p-12 text-center space-y-4">
                <div className="text-6xl">📈</div>
                <div className="max-w-md mx-auto">
                  <h3 className="text-lg font-bold">Dynamic Hiring Analytics</h3>
                  <p className="text-gray-500">Track how your job postings are performing across different regions and field of studies.</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
