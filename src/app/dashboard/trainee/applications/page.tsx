'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Application {
  id: string;
  status: string;
  appliedAt: string;
  matchScore: number;
  job: {
    id: string;
    titleEn: string;
    sector: string;
    employmentType: string;
    company: {
      name: string;
      city: string;
      employerBadge: string;
    };
  };
}

export default function ApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-100 text-blue-700';
      case 'reviewed':
        return 'bg-yellow-100 text-yellow-700';
      case 'shortlisted':
        return 'bg-purple-100 text-purple-700';
      case 'referred':
        return 'bg-orange-100 text-orange-700';
      case 'hired':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied': return '📤';
      case 'reviewed': return '👀';
      case 'shortlisted': return '⭐';
      case 'referred': return '📄';
      case 'hired': return '✅';
      case 'rejected': return '❌';
      default: return '📝';
    }
  };

  const filteredApplications = statusFilter === 'all'
    ? applications
    : applications.filter(app => app.status === statusFilter);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <a href="/dashboard/trainee" className="text-gray-600 hover:text-gray-900">
              ← Back
            </a>
            <div className="w-1 h-6 bg-gray-300"></div>
            <h1 className="text-xl font-bold">My Applications</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="text-sm text-gray-600">Total</div>
              <div className="text-2xl font-bold text-gray-900">{applications.length}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="text-sm text-gray-600">Under Review</div>
              <div className="text-2xl font-bold text-yellow-600">
                {applications.filter(a => ['reviewed', 'shortlisted'].includes(a.status)).length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="text-sm text-gray-600">Referred</div>
              <div className="text-2xl font-bold text-orange-600">
                {applications.filter(a => a.status === 'referred').length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="text-sm text-gray-600">Hired</div>
              <div className="text-2xl font-bold text-green-600">
                {applications.filter(a => a.status === 'hired').length}
              </div>
            </div>
          </div>

          {/* Status Filters */}
          <div className="bg-white rounded-xl shadow-sm p-2 mb-6 flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'All' },
              { value: 'applied', label: 'Applied' },
              { value: 'reviewed', label: 'Reviewed' },
              { value: 'shortlisted', label: 'Shortlisted' },
              { value: 'referred', label: 'Referred' },
              { value: 'hired', label: 'Hired' },
              { value: 'rejected', label: 'Rejected' },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`px-4 py-2 rounded-lg transition ${
                  statusFilter === filter.value
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Applications List */}
          {loading ? (
            <div className="text-center py-12">Loading applications...</div>
          ) : filteredApplications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">📄</div>
              <h2 className="text-2xl font-bold mb-2">
                {statusFilter === 'all' ? 'No applications yet' : `No ${statusFilter} applications`}
              </h2>
              <p className="text-gray-600 mb-6">
                {statusFilter === 'all'
                  ? 'Start applying to jobs to see them here'
                  : 'Try selecting a different status filter'}
              </p>
              {statusFilter === 'all' && (
                <a
                  href="/dashboard/trainee/jobs"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Browse Jobs
                </a>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <div
                  key={application.id}
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold">{application.job.titleEn}</h3>
                        {application.job.company.employerBadge === 'verified' && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      <div className="text-gray-600 mb-3">
                        {application.job.company.name} • {application.job.company.city}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {application.job.sector}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {application.job.employmentType}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2 ml-4">
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)} {application.status}
                      </span>
                      {application.matchScore && (
                        <div className="text-center">
                          <div className="text-xs text-gray-600">Match Score</div>
                          <div className="text-lg font-bold text-blue-600">
                            {application.matchScore}%
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-gray-600">
                        Applied {new Date(application.appliedAt).toLocaleDateString()}
                      </div>
                      <a
                        href={`/dashboard/trainee/applications/${application.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Details →
                      </a>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-2">
                        <span>Applied</span>
                        <span>Reviewed</span>
                        <span>Shortlisted</span>
                        <span>Hired</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            application.status === 'hired'
                              ? 'bg-green-600'
                              : application.status === 'rejected'
                              ? 'bg-red-600'
                              : 'bg-blue-600'
                          }`}
                          style={{
                            width: `${
                              application.status === 'applied' ? 25 :
                              application.status === 'reviewed' ? 50 :
                              application.status === 'shortlisted' ? 75 :
                              application.status === 'hired' ? 100 :
                              application.status === 'rejected' ? 100 : 25
                            }%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Status Messages */}
                  {application.status === 'shortlisted' && (
                    <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-700">
                      🎉 Great news! The employer has shortlisted you. They may contact you soon for an interview.
                    </div>
                  )}
                  {application.status === 'referred' && (
                    <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-700">
                      📄 Your ILJC officer has referred you to this employer with a recommendation letter.
                    </div>
                  )}
                  {application.status === 'hired' && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                      ✅ Congratulations! You've been hired for this position.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Tips Section */}
          {applications.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
              <h3 className="font-semibold mb-4">💡 Application Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Check your applications regularly for status updates</span>
                </div>
                <div className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Keep your profile and skills up to date</span>
                </div>
                <div className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Higher match scores increase your chances</span>
                </div>
                <div className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Respond promptly to employer contacts</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
