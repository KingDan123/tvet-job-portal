'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface TrainingSession {
  id: string;
  title: string;
  description: string;
  type: string;
  scheduledAt: string;
  duration: number;
  location: string;
  capacity: number;
  attendanceCount?: number;
}

export default function TrainingSessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetchSessions(token);
  }, [router, filter]);

  const fetchSessions = async (token: string) => {
    try {
      const response = await fetch(`/api/officer/training?filter=${filter}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setSessions(data.data);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
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
              <h1 className="text-xl font-bold">FLW-3: Training Sessions</h1>
            </div>
            <a
              href="/dashboard/officer/training/create"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              + Create Session
            </a>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-2 mb-6 inline-flex space-x-2">
          {[
            { value: 'upcoming', label: 'Upcoming', icon: '📅' },
            { value: 'past', label: 'Past', icon: '✅' },
            { value: 'all', label: 'All', icon: '📋' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value as any)}
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

        {/* Sessions Grid */}
        {loading ? (
          <div className="text-center py-12">Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🎓</div>
            <h2 className="text-2xl font-bold mb-2">No training sessions</h2>
            <p className="text-gray-600 mb-6">
              Create your first pre-employment training session
            </p>
            <a
              href="/dashboard/officer/training/create"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Create Session
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        session.type === 'soft_skill'
                          ? 'bg-blue-100 text-blue-700'
                          : session.type === 'technical'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {session.type.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {session.attendanceCount || 0} / {session.capacity}
                  </span>
                </div>

                <h3 className="text-lg font-bold mb-2">{session.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {session.description}
                </p>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center text-gray-600">
                    <span className="mr-2">📅</span>
                    {new Date(session.scheduledAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="mr-2">⏰</span>
                    {new Date(session.scheduledAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {' '}({session.duration} min)
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="mr-2">📍</span>
                    {session.location}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <a
                    href={`/dashboard/officer/training/${session.id}`}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition text-sm"
                  >
                    View Details
                  </a>
                  <a
                    href={`/dashboard/officer/training/${session.id}/attendance`}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
                  >
                    📋 Attendance
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600">Total Sessions</div>
            <div className="text-2xl font-bold text-gray-900">{sessions.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600">Soft Skills</div>
            <div className="text-2xl font-bold text-blue-600">
              {sessions.filter(s => s.type === 'soft_skill').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600">Technical</div>
            <div className="text-2xl font-bold text-green-600">
              {sessions.filter(s => s.type === 'technical').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600">Orientation</div>
            <div className="text-2xl font-bold text-purple-600">
              {sessions.filter(s => s.type === 'orientation').length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
