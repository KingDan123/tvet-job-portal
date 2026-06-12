'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Referral {
  id: string;
  status: string;
  sentAt: string;
  followupDueAt: string;
  notes: string;
  trainee: {
    fullName: string;
    program: string;
  };
  job: {
    titleEn: string;
    company: {
      name: string;
    };
  };
}

export default function ReferralsPage() {
  const router = useRouter();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetchReferrals(token);
  }, [router, statusFilter]);

  const fetchReferrals = async (token: string) => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/officer/referrals?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setReferrals(data.data);
      }
    } catch (error) {
      console.error('Error fetching referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'acknowledged':
        return 'bg-blue-100 text-blue-700';
      case 'hired':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
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
              <h1 className="text-xl font-bold">FLW-5: Referral Letters</h1>
            </div>
            <a
              href="/dashboard/officer/referrals/create"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              + New Referral
            </a>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Status Filters */}
        <div className="bg-white rounded-xl shadow-sm p-2 mb-6 inline-flex space-x-2">
          {[
            { value: 'all', label: 'All', icon: '📋' },
            { value: 'pending', label: 'Pending', icon: '⏳' },
            { value: 'acknowledged', label: 'Acknowledged', icon: '✉️' },
            { value: 'hired', label: 'Hired', icon: '✅' },
            { value: 'rejected', label: 'Rejected', icon: '❌' },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`px-6 py-2 rounded-lg transition ${
                statusFilter === filter.value
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {filter.icon} {filter.label}
            </button>
          ))}
        </div>

        {/* Referrals List */}
        {loading ? (
          <div className="text-center py-12">Loading referrals...</div>
        ) : referrals.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📄</div>
            <h2 className="text-2xl font-bold mb-2">No referrals yet</h2>
            <p className="text-gray-600 mb-6">
              Create referral letters to connect graduates with employers
            </p>
            <a
              href="/dashboard/officer/referrals/create"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Create First Referral
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {referrals.map((referral) => (
              <div
                key={referral.id}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-bold">
                        {referral.trainee.fullName}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(referral.status)}`}
                      >
                        {referral.status}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 space-y-1 mb-3">
                      <div>
                        <span className="font-medium">Program:</span> {referral.trainee.program}
                      </div>
                      <div>
                        <span className="font-medium">Position:</span> {referral.job.titleEn}
                      </div>
                      <div>
                        <span className="font-medium">Company:</span> {referral.job.company.name}
                      </div>
                      <div>
                        <span className="font-medium">Sent:</span>{' '}
                        {new Date(referral.sentAt).toLocaleDateString()}
                      </div>
                      {referral.followupDueAt && (
                        <div className="text-orange-600 font-medium">
                          <span>Follow-up Due:</span>{' '}
                          {new Date(referral.followupDueAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {referral.notes && (
                      <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                        <strong>Notes:</strong> {referral.notes}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <a
                      href={`/dashboard/officer/referrals/${referral.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm text-center"
                    >
                      View Details
                    </a>
                    <button
                      onClick={() => {
                        // Download referral letter PDF
                        window.open(`/api/officer/referrals/${referral.id}/pdf`, '_blank');
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
                    >
                      📄 Download Letter
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600">Total Referrals</div>
            <div className="text-2xl font-bold text-gray-900">{referrals.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600">Pending Response</div>
            <div className="text-2xl font-bold text-yellow-600">
              {referrals.filter(r => r.status === 'pending').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600">Successful Hires</div>
            <div className="text-2xl font-bold text-green-600">
              {referrals.filter(r => r.status === 'hired').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600">Success Rate</div>
            <div className="text-2xl font-bold text-purple-600">
              {referrals.length > 0
                ? Math.round((referrals.filter(r => r.status === 'hired').length / referrals.length) * 100)
                : 0}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
