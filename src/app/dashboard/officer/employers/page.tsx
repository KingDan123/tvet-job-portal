'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Employer {
  id: string;
  name: string;
  sector: string;
  city: string;
  contactCount: number;
  lastContactDate: string | null;
  agreementStatus: string;
  hiresCount: number;
}

export default function EmployerCRMPage() {
  const router = useRouter();
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetchEmployers(token);
  }, [router, filter]);

  const fetchEmployers = async (token: string) => {
    try {
      const response = await fetch(`/api/officer/employers?filter=${filter}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setEmployers(data.data);
      }
    } catch (error) {
      console.error('Error fetching employers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <a href="/dashboard/officer" className="text-gray-600 hover:text-gray-900">
                ← Back
              </a>
              <div className="w-1 h-6 bg-gray-300"></div>
              <h1 className="text-xl font-bold">FLW-4: Employer Relationship Management</h1>
            </div>
            <a
              href="/dashboard/officer/employers/add"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              + Add Employer
            </a>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-2 mb-6 inline-flex space-x-2">
          {[
            { value: 'all', label: 'All Employers', icon: '🏢' },
            { value: 'active', label: 'Active Partners', icon: '✅' },
            { value: 'prospect', label: 'Prospects', icon: '🎯' },
            { value: 'inactive', label: 'Inactive', icon: '💤' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-6 py-2 rounded-lg transition ${
                filter === tab.value
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Employers Grid */}
        {loading ? (
          <div className="text-center py-12">Loading employers...</div>
        ) : employers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🏢</div>
            <h2 className="text-2xl font-bold mb-2">No employers yet</h2>
            <p className="text-gray-600 mb-6">
              Build relationships with industries and MSBs
            </p>
            <a
              href="/dashboard/officer/employers/add"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Add First Employer
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employers.map((employer) => (
              <div
                key={employer.id}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-1">{employer.name}</h3>
                    <div className="text-sm text-gray-600">
                      {employer.sector} • {employer.city}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      employer.agreementStatus === 'active'
                        ? 'bg-green-100 text-green-700'
                        : employer.agreementStatus === 'prospect'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {employer.agreementStatus}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Contacts:</span>
                    <span className="font-semibold">{employer.contactCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Hires:</span>
                    <span className="font-semibold text-green-600">{employer.hiresCount}</span>
                  </div>
                  {employer.lastContactDate && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Last Contact:</span>
                      <span className="text-gray-900">
                        {new Date(employer.lastContactDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <a
                    href={`/dashboard/officer/employers/${employer.id}`}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition text-sm"
                  >
                    View Details
                  </a>
                  <a
                    href={`/dashboard/officer/employers/${employer.id}/contact`}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
                  >
                    Log Contact
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600">Total Employers</div>
            <div className="text-2xl font-bold text-gray-900">{employers.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600">Active Partners</div>
            <div className="text-2xl font-bold text-green-600">
              {employers.filter(e => e.agreementStatus === 'active').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600">Total Hires</div>
            <div className="text-2xl font-bold text-purple-600">
              {employers.reduce((sum, e) => sum + e.hiresCount, 0)}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600">This Month Contacts</div>
            <div className="text-2xl font-bold text-blue-600">
              {employers.reduce((sum, e) => sum + e.contactCount, 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
