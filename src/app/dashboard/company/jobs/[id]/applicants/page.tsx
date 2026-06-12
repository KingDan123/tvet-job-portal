'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';

interface Applicant {
  id: string;
  status: string;
  appliedAt: string;
  matchScore: number;
  trainee: {
    id: string;
    fullName: string;
    program: string;
    level: number;
    profileCompletePct: number;
  };
}

export default function JobApplicantsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: jobId } = use(params);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchApplicants(token);
  }, [jobId]);

  const fetchApplicants = async (token: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/applicants`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setApplicants(data.data);
        setJobTitle(data.jobTitle);
      }
    } catch (error) {
      console.error('Error fetching applicants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`/api/applications/${appId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) fetchApplicants(token!);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center space-x-3">
          <a href="/dashboard/company/jobs" className="text-gray-600 hover:text-gray-900">← Jobs</a>
          <div className="w-1 h-6 bg-gray-300"></div>
          <h1 className="text-xl font-bold">Applicants for: {jobTitle || 'Loading...'}</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">Loading applicants...</div>
        ) : applicants.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
            No applications received yet for this position.
          </div>
        ) : (
          <div className="space-y-4">
            {applicants.map((app) => (
              <div key={app.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <h2 className="text-xl font-bold">{app.trainee.fullName}</h2>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700`}>
                      Match: {app.matchScore}%
                    </span>
                  </div>
                  <div className="text-gray-600 text-sm">{app.trainee.program} • Level {app.trainee.level}</div>
                  <div className="text-xs text-gray-400 mt-2">Applied on {new Date(app.appliedAt).toLocaleDateString()}</div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right mr-6">
                    <div className="text-xs text-gray-500 uppercase font-bold mb-1">Current Status</div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${app.status === 'applied' ? 'bg-gray-100' : app.status === 'shortlisted' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                      {app.status}
                    </span>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <button onClick={() => router.push(`/dashboard/company/candidates/${app.trainee.id}`)} className="text-blue-600 hover:underline text-sm font-semibold">View Profile</button>
                    {app.status === 'applied' && (
                      <button onClick={() => handleUpdateStatus(app.id, 'reviewed')} className="bg-blue-600 text-white px-3 py-1 rounded text-xs">Mark as Reviewed</button>
                    )}
                    {['applied', 'reviewed'].includes(app.status) && (
                      <button onClick={() => handleUpdateStatus(app.id, 'shortlisted')} className="bg-yellow-500 text-white px-3 py-1 rounded text-xs">Shortlist</button>
                    )}
                    {app.status === 'shortlisted' && (
                      <button onClick={() => handleUpdateStatus(app.id, 'hired')} className="bg-green-600 text-white px-3 py-1 rounded text-xs">Mark as Hired</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
