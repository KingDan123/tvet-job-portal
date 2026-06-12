'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Match {
  traineeId: string;
  jobId: string;
  score: number;
  breakdown: {
    fieldMatch: number;
    skillOverlap: number;
    locationMatch: number;
    recency: number;
  };
  trainee: {
    fullName: string;
    program: string;
    graduationYear: number;
  };
  job: {
    titleEn: string;
    company: {
      name: string;
    };
  };
}

export default function SmartMatchingPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'job-first' | 'trainee-first'>('job-first');
  const [selectedId, setSelectedId] = useState('');
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [trainees, setTrainees] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetchJobs(token);
    fetchTrainees(token);
  }, [router]);

  const fetchJobs = async (token: string) => {
    try {
      const response = await fetch('/api/jobs', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setJobs(data.data);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchTrainees = async (token: string) => {
    try {
      const response = await fetch('/api/officer/graduates?status=seeking', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setTrainees(data.data);
      }
    } catch (error) {
      console.error('Error fetching trainees:', error);
    }
  };

  const handleFindMatches = async () => {
    if (!selectedId) {
      alert('Please select a job or trainee first');
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('accessToken');

    try {
      const endpoint = mode === 'job-first'
        ? `/api/officer/matching/job/${selectedId}`
        : `/api/officer/matching/trainee/${selectedId}`;

      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setMatches(data.data);
      }
    } catch (error) {
      console.error('Error finding matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-blue-100';
    if (score >= 40) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <a href="/dashboard/officer" className="text-gray-600 hover:text-gray-900">
              ← Back
            </a>
            <div className="w-1 h-6 bg-gray-300"></div>
            <h1 className="text-xl font-bold">FLW-6: Smart Matching Algorithm</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Control Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-bold mb-4">Matching Controls</h2>

              {/* Mode Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Match Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setMode('job-first');
                      setSelectedId('');
                      setMatches([]);
                    }}
                    className={`px-4 py-3 rounded-lg font-medium transition ${
                      mode === 'job-first'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Job → Trainees
                  </button>
                  <button
                    onClick={() => {
                      setMode('trainee-first');
                      setSelectedId('');
                      setMatches([]);
                    }}
                    className={`px-4 py-3 rounded-lg font-medium transition ${
                      mode === 'trainee-first'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Trainee → Jobs
                  </button>
                </div>
              </div>

              {/* Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {mode === 'job-first' ? 'Select Job' : 'Select Trainee'}
                </label>
                <select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">-- Select --</option>
                  {mode === 'job-first'
                    ? jobs.map((job) => (
                        <option key={job.id} value={job.id}>
                          {job.titleEn} at {job.company.name}
                        </option>
                      ))
                    : trainees.map((trainee) => (
                        <option key={trainee.id} value={trainee.id}>
                          {trainee.fullName} ({trainee.program})
                        </option>
                      ))}
                </select>
              </div>

              {/* Find Button */}
              <button
                onClick={handleFindMatches}
                disabled={!selectedId || loading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Finding Matches...' : '🎯 Find Best Matches'}
              </button>

              {/* Algorithm Info */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2 text-sm">
                  📊 Scoring Breakdown
                </h3>
                <div className="space-y-1 text-xs text-blue-800">
                  <div className="flex justify-between">
                    <span>Field Match:</span>
                    <span className="font-medium">40 points</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Skill Overlap:</span>
                    <span className="font-medium">30 points</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Location Match:</span>
                    <span className="font-medium">20 points</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Recency:</span>
                    <span className="font-medium">10 points</span>
                  </div>
                  <div className="border-t border-blue-200 mt-2 pt-2 flex justify-between font-bold">
                    <span>Total:</span>
                    <span>100 points</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            {matches.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">🎯</div>
                <h2 className="text-2xl font-bold mb-2">No Matches Yet</h2>
                <p className="text-gray-600">
                  Select a {mode === 'job-first' ? 'job' : 'trainee'} and click "Find Best Matches"
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">
                    Top {matches.length} Matches (Ranked by Score)
                  </h2>
                  <span className="text-sm text-gray-600">
                    Higher scores = Better fit
                  </span>
                </div>

                {matches.map((match, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            #{index + 1}
                          </div>
                          <h3 className="text-lg font-bold">
                            {mode === 'job-first' ? match.trainee.fullName : match.job.titleEn}
                          </h3>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          {mode === 'job-first' ? (
                            <>
                              <div>Program: {match.trainee.program}</div>
                              <div>Graduation Year: {match.trainee.graduationYear}</div>
                            </>
                          ) : (
                            <>
                              <div>Company: {match.job.company.name}</div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Overall Score */}
                      <div className={`px-6 py-4 ${getScoreBg(match.score)} rounded-xl`}>
                        <div className="text-xs text-gray-600 mb-1">Match Score</div>
                        <div className={`text-3xl font-bold ${getScoreColor(match.score)}`}>
                          {match.score}
                        </div>
                        <div className="text-xs text-gray-600">/ 100</div>
                      </div>
                    </div>

                    {/* Breakdown */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(match.breakdown).map(([key, value]) => (
                        <div key={key} className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-600 mb-1 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            {Math.round(value as number)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex space-x-3">
                      <a
                        href={`/dashboard/officer/referrals/create?trainee=${match.traineeId}&job=${match.jobId}`}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                      >
                        📄 Create Referral
                      </a>
                      <a
                        href={`/dashboard/officer/graduates/${match.traineeId}`}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
                      >
                        View Trainee
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
