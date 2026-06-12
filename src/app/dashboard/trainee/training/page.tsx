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
  attended?: boolean;
}

export default function TraineeTrainingPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');

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
      const response = await fetch(`/api/trainees/training?filter=${filter}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setSessions(data.data);
      }
    } catch (error) {
      console.error('Error fetching training sessions:', error);
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-xl font-bold">Training Sessions</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">🎓 Pre-Employment Training</h3>
            <p className="text-sm text-blue-700">
              These training sessions are designed to improve your soft skills, technical knowledge, and 
              workplace readiness. Attendance is tracked and displayed on your profile.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-xl shadow-sm p-2 mb-6 inline-flex space-x-2">
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-6 py-2 rounded-lg transition ${
                filter === 'upcoming'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              📅 Upcoming
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-6 py-2 rounded-lg transition ${
                filter === 'past'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              ✅ Past
            </button>
          </div>

          {/* Sessions List */}
          {loading ? (
            <div className="text-center py-12">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">🎓</div>
              <h2 className="text-2xl font-bold mb-2">
                {filter === 'upcoming' ? 'No upcoming sessions' : 'No past sessions'}
              </h2>
              <p className="text-gray-600">
                {filter === 'upcoming'
                  ? 'Check back later for new training opportunities'
                  : 'You haven\'t attended any training sessions yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
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
                        {session.attended !== undefined && (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              session.attended
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {session.attended ? '✓ Attended' : 'Not Attended'}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold mb-2">{session.title}</h3>
                      {session.description && (
                        <p className="text-gray-600 mb-4">{session.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">📅</span>
                      {new Date(session.scheduledAt).toLocaleDateString('en-GB', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">⏰</span>
                      {new Date(session.scheduledAt).toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {' '}({session.duration} min)
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">📍</span>
                      {session.location}
                    </div>
                  </div>

                  {filter === 'upcoming' && new Date(session.scheduledAt) > new Date() && (
                    <div className="mt-4 flex space-x-3">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
                        Add to Calendar
                      </button>
                      <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm">
                        Set Reminder
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Benefits Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
            <h3 className="font-semibold mb-4">Why Attend Training Sessions?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <div className="text-2xl mr-3">✓</div>
                <div>
                  <div className="font-medium mb-1">Improve Your Skills</div>
                  <div className="text-sm text-gray-600">
                    Learn essential soft skills like communication and teamwork
                  </div>
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-2xl mr-3">✓</div>
                <div>
                  <div className="font-medium mb-1">Build Your Profile</div>
                  <div className="text-sm text-gray-600">
                    Training completion appears on your profile
                  </div>
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-2xl mr-3">✓</div>
                <div>
                  <div className="font-medium mb-1">Network with Peers</div>
                  <div className="text-sm text-gray-600">
                    Meet other graduates and share experiences
                  </div>
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-2xl mr-3">✓</div>
                <div>
                  <div className="font-medium mb-1">Increase Job Chances</div>
                  <div className="text-sm text-gray-600">
                    Employers prefer candidates with soft skills training
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
