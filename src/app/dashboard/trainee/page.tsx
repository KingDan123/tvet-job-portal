'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Application {
  id: string;
  status: string;
  appliedAt: string;
  job: {
    titleEn: string;
    company: {
      name: string;
      city: string;
    };
  };
}

export default function TraineeDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check auth
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'trainee') {
      router.push('/');
      return;
    }

    setUser(parsedUser);
    fetchApplications(token);
  }, [router]);

  const fetchApplications = async (token: string) => {
    try {
      const response = await fetch('/api/applications', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setApplications(data.data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
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
                href="/dashboard/trainee"
                className="block px-4 py-3 bg-blue-50 text-blue-600 rounded-lg font-medium"
              >
                📊 Dashboard
              </a>
              <a
                href="/dashboard/trainee/profile"
                className="block px-4 py-3 hover:bg-gray-50 rounded-lg transition"
              >
                👤 My Profile
              </a>
              <a
                href="/dashboard/trainee/skills"
                className="block px-4 py-3 hover:bg-gray-50 rounded-lg transition"
              >
                🎯 My Skills
              </a>
              <a
                href="/dashboard/trainee/jobs"
                className="block px-4 py-3 hover:bg-gray-50 rounded-lg transition"
              >
                🔍 Browse Jobs
              </a>
              <a
                href="/dashboard/trainee/applications"
                className="block px-4 py-3 hover:bg-gray-50 rounded-lg transition"
              >
                📝 My Applications
              </a>
              <a
                href="/dashboard/trainee/training"
                className="block px-4 py-3 hover:bg-gray-50 rounded-lg transition"
              >
                🎓 Training Sessions
              </a>
              <a
                href="/dashboard/trainee/settings"
                className="block px-4 py-3 hover:bg-gray-50 rounded-lg transition"
              >
                ⚙️ Settings
              </a>
            </nav>
          </aside>

          {/* Main Dashboard */}
          <main className="lg:col-span-2">
            <h1 className="text-3xl font-bold mb-6">Welcome Back!</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-gray-600 text-sm mb-1">Total Applications</div>
                <div className="text-3xl font-bold text-blue-600">{applications.length}</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-gray-600 text-sm mb-1">Under Review</div>
                <div className="text-3xl font-bold text-yellow-600">
                  {applications.filter(a => a.status === 'reviewed').length}
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-gray-600 text-sm mb-1">Profile Complete</div>
                <div className="text-3xl font-bold text-green-600">45%</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-xl p-6 text-white mb-8">
              <h2 className="text-2xl font-bold mb-3">Complete Your Profile</h2>
              <p className="mb-4 opacity-90">
                A complete profile increases your chances of getting hired by 3x!
              </p>
              <a
                href="/dashboard/trainee/profile"
                className="inline-block px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Complete Profile
              </a>
            </div>

            {/* Recent Applications */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Recent Applications</h2>
              {applications.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-5xl mb-4">📄</div>
                  <p className="text-gray-600 mb-4">You haven&apos;t applied to any jobs yet</p>
                  <a
                    href="/dashboard/trainee/jobs"
                    className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Browse Jobs
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.slice(0, 5).map((app) => (
                    <div
                      key={app.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{app.job.titleEn}</h3>
                          <p className="text-gray-600 text-sm">
                            {app.job.company.name} · {app.job.company.city}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Applied {new Date(app.appliedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            app.status === 'applied'
                              ? 'bg-blue-100 text-blue-700'
                              : app.status === 'reviewed'
                              ? 'bg-yellow-100 text-yellow-700'
                              : app.status === 'shortlisted'
                              ? 'bg-purple-100 text-purple-700'
                              : app.status === 'hired'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
