'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Placement {
  id: string;
  status: string;
  placedAt: string;
  trainee: {
    fullName: string;
    program: string;
  };
  company: {
    name: string;
    sector: string;
  };
  job: {
    titleEn: string;
  } | null;
  followups: Array<{
    followupDay: number;
    completedAt: string | null;
    traineeSatisfaction: number | null;
    employerSatisfaction: number | null;
  }>;
}

export default function PlacementsPage() {
  const router = useRouter();
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('active');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetchPlacements(token);
  }, [router, statusFilter]);

  const fetchPlacements = async (token: string) => {
    try {
      const response = await fetch(`/api/officer/placements?status=${statusFilter}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setPlacements(data.data);
      }
    } catch (error) {
      console.error('Error fetching placements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFollowupStatus = (followups: Placement['followups']) => {
    const pending = followups.filter(f => !f.completedAt);
    const completed = followups.filter(f => f.completedAt);
    return { pending: pending.length, completed: completed.length };
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
              <h1 className="text-xl font-bold">FLW-9: Placement Supervision & Follow-ups</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Status Filters */}
        <div className="bg-white rounded-xl shadow-sm p-2 mb-6 inline-flex space-x-2">
          {[
            { value: 'active', label: 'Active', icon: '💼' },
            { value: 'all', label: 'All', icon: '📋' },
            { value: 'resigned', label: 'Resigned', icon: '👋' },
            { value: 'promoted', label: 'Promoted', icon: '⬆️' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-6 py-2 rounded-lg transition ${
                statusFilter === tab.value
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Placements List */}
        {loading ? (
          <div className="text-center py-12">Loading placements...</div>
        ) : placements.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">💼</div>
            <h2 className="text-2xl font-bold mb-2">No placements yet</h2>
            <p className="text-gray-600">
              Successful referrals will appear here for follow-up tracking
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {placements.map((placement) => {
              const followupStatus = getFollowupStatus(placement.followups);
              
              return (
                <div
                  key={placement.id}
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold">
                          {placement.trainee.fullName}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            placement.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : placement.status === 'promoted'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {placement.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="text-sm space-y-1">
                          <div className="text-gray-600">
                            <span className="font-medium">Program:</span> {placement.trainee.program}
                          </div>
                          <div className="text-gray-600">
                            <span className="font-medium">Company:</span> {placement.company.name}
                          </div>
                          <div className="text-gray-600">
                            <span className="font-medium">Sector:</span> {placement.company.sector}
                          </div>
                        </div>
                        <div className="text-sm space-y-1">
                          {placement.job && (
                            <div className="text-gray-600">
                              <span className="font-medium">Position:</span> {placement.job.titleEn}
                            </div>
                          )}
                          <div className="text-gray-600">
                            <span className="font-medium">Placed:</span>{' '}
                            {new Date(placement.placedAt).toLocaleDateString()}
                          </div>
                          <div className="text-gray-600">
                            <span className="font-medium">Duration:</span>{' '}
                            {Math.floor((Date.now() - new Date(placement.placedAt).getTime()) / (1000 * 60 * 60 * 24))} days
                          </div>
                        </div>
                      </div>

                      {/* Follow-up Progress */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-sm">Follow-up Progress</h4>
                          <span className="text-xs text-gray-600">
                            {followupStatus.completed} / {placement.followups.length} completed
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          {[30, 60, 90].map((day) => {
                            const followup = placement.followups.find(f => f.followupDay === day);
                            const isCompleted = followup?.completedAt;
                            
                            return (
                              <div
                                key={day}
                                className={`text-center p-3 rounded-lg ${
                                  isCompleted
                                    ? 'bg-green-100 border border-green-300'
                                    : 'bg-white border border-gray-200'
                                }`}
                              >
                                <div className="text-xs text-gray-600 mb-1">{day} Day</div>
                                <div className="text-lg font-bold">
                                  {isCompleted ? '✅' : '⏳'}
                                </div>
                                {followup?.traineeSatisfaction && (
                                  <div className="text-xs text-gray-600 mt-1">
                                    ⭐ {followup.traineeSatisfaction}/5
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <a
                        href={`/dashboard/officer/placements/${placement.id}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm text-center"
                      >
                        View Details
                      </a>
                      {followupStatus.pending > 0 && (
                        <a
                          href={`/dashboard/officer/placements/${placement.id}/followup`}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm text-center"
                        >
                          Record Follow-up
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600">Total Placements</div>
            <div className="text-2xl font-bold text-gray-900">{placements.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600">Active</div>
            <div className="text-2xl font-bold text-green-600">
              {placements.filter(p => p.status === 'active').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600">Retention Rate</div>
            <div className="text-2xl font-bold text-blue-600">
              {placements.length > 0
                ? Math.round((placements.filter(p => p.status === 'active').length / placements.length) * 100)
                : 0}%
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600">Avg Satisfaction</div>
            <div className="text-2xl font-bold text-purple-600">
              {(() => {
                const scores = placements.flatMap(p => 
                  p.followups
                    .filter(f => f.traineeSatisfaction)
                    .map(f => f.traineeSatisfaction!)
                );
                return scores.length > 0
                  ? (scores.reduce((sum, s) => sum + s, 0) / scores.length).toFixed(1)
                  : 'N/A';
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
