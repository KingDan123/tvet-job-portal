'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Company {
  id: string;
  name: string;
  sector: string;
  tinNumber: string;
  city: string;
  isVerified: boolean;
  employerBadge: string;
  subscriptionTier: string;
  createdAt: string;
  user: {
    email: string;
  };
}

export default function CompaniesManagementPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetchCompanies(token);
  }, [router, filter]);

  const fetchCompanies = async (token: string) => {
    try {
      const response = await fetch(`/api/admin/companies?filter=${filter}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setCompanies(data.data);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (companyId: string, approved: boolean) => {
    const token = localStorage.getItem('accessToken');
    
    try {
      const response = await fetch(`/api/admin/companies/${companyId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ approved }),
      });

      const data = await response.json();
      if (data.success) {
        // Refresh list
        fetchCompanies(token!);
      } else {
        alert(data.error || 'Verification failed');
      }
    } catch (error) {
      alert('Network error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <a href="/dashboard/admin" className="text-gray-600 hover:text-gray-900">
              ← Back
            </a>
            <div className="w-1 h-6 bg-gray-300"></div>
            <h1 className="text-xl font-bold">Company Verification</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-2 mb-6 inline-flex space-x-2">
          {[
            { value: 'pending', label: 'Pending Verification', icon: '⏳' },
            { value: 'verified', label: 'Verified', icon: '✅' },
            { value: 'all', label: 'All Companies', icon: '🏢' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-6 py-2 rounded-lg transition ${
                filter === tab.value
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Companies List */}
        {loading ? (
          <div className="text-center py-12">Loading companies...</div>
        ) : companies.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🏢</div>
            <h2 className="text-2xl font-bold mb-2">No companies found</h2>
            <p className="text-gray-600">No companies match the selected filter</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    TIN / Sector
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Subscription
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {companies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{company.name}</div>
                      <div className="text-sm text-gray-500">{company.user.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="text-gray-900">{company.tinNumber || 'N/A'}</div>
                      <div className="text-gray-500">{company.sector}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {company.city}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                        {company.subscriptionTier}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          company.isVerified
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {company.isVerified ? '✓ Verified' : 'Pending'}
                      </span>
                      {company.employerBadge !== 'none' && (
                        <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                          {company.employerBadge}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {!company.isVerified ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleVerify(company.id, true)}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition text-xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleVerify(company.id, false)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-xs"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <a
                          href={`/dashboard/admin/companies/${company.id}`}
                          className="text-purple-600 hover:text-purple-800 font-medium"
                        >
                          View Details
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600">Total Companies</div>
            <div className="text-2xl font-bold text-gray-900">{companies.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600">Verified</div>
            <div className="text-2xl font-bold text-green-600">
              {companies.filter(c => c.isVerified).length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600">Pending</div>
            <div className="text-2xl font-bold text-yellow-600">
              {companies.filter(c => !c.isVerified).length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600">Paying Customers</div>
            <div className="text-2xl font-bold text-purple-600">
              {companies.filter(c => c.subscriptionTier !== 'free').length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
