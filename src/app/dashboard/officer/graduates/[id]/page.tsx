'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';

interface GraduateDetails {
  id: string;
  fullName: string;
  program: string;
  level: number;
  graduationYear: number;
  gpa: string;
  employmentStatus: string;
  profileCompletePct: number;
  bio: string;
  region: string;
  zone: string;
  woreda: string;
  studentId: string;
  user: {
    email: string;
    phone: string;
  };
  skills: Array<{
    skill: { nameEn: string; category: string };
    proficiencyLevel: number;
  }>;
}

export default function GraduateDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: graduateId } = use(params);
  const [graduate, setGraduate] = useState<GraduateDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchGraduate(token);
  }, [graduateId]);

  const fetchGraduate = async (token: string) => {
    try {
      const response = await fetch(`/api/officer/graduates/${graduateId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setGraduate(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: string) => {
    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`/api/officer/graduates/${graduateId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status }),
      });
      if (response.ok) fetchGraduate(token!);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) return <div className="p-12 text-center">Loading graduate profile...</div>;
  if (!graduate) return <div className="p-12 text-center">Graduate not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center space-x-3">
          <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">← Back</button>
          <div className="w-1 h-6 bg-gray-300"></div>
          <h1 className="text-xl font-bold">Graduate Profile: {graduate.fullName}</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{graduate.fullName}</h2>
                  <p className="text-lg text-blue-600 font-medium">{graduate.program} • Level {graduate.level}</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase ${graduate.employmentStatus === 'seeking' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {graduate.employmentStatus}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Contact Details</h3>
                  <p className="text-gray-700">📧 {graduate.user.email}</p>
                  <p className="text-gray-700">📞 {graduate.user.phone || 'No phone provided'}</p>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Location</h3>
                  <p className="text-gray-700">📍 {graduate.region}, {graduate.zone}, {graduate.woreda}</p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Biography</h3>
                <p className="text-gray-600 italic">"{graduate.bio || 'No biography provided'}"</p>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h3 className="text-xl font-bold mb-4">Technical & Soft Skills</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {graduate.skills.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-bold">{s.skill.nameEn}</div>
                      <div className="text-xs text-gray-500">{s.skill.category}</div>
                    </div>
                    <div className="flex space-x-1">
                      {[1,2,3,4,5].map(l => (
                        <div key={l} className={`w-2 h-2 rounded-full ${l <= s.proficiencyLevel ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                      ))}
                    </div>
                  </div>
                ))}
                {graduate.skills.length === 0 && <p className="text-gray-500">No skills listed.</p>}
              </div>
            </div>
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-blue-600">
              <h3 className="font-bold text-lg mb-4">Case Management</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => router.push(`/dashboard/officer/matching?trainee=${graduate.id}`)}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
                >
                  🎯 Run Matching Engine
                </button>
                <button 
                  onClick={() => router.push(`/dashboard/officer/referrals/create?trainee=${graduate.id}`)}
                  className="w-full py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition"
                >
                  📄 Create Referral Letter
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-sm text-gray-400 uppercase mb-4">Update Employment Track</h3>
              <div className="space-y-2">
                <button onClick={() => updateStatus('seeking')} className="w-full py-2 text-left px-4 rounded hover:bg-gray-50 flex items-center">
                  <span className="mr-2">🔍</span> Seeking Employment
                </button>
                <button onClick={() => updateStatus('employed')} className="w-full py-2 text-left px-4 rounded hover:bg-gray-50 flex items-center">
                  <span className="mr-2">💼</span> Mark as Employed
                </button>
                <button onClick={() => updateStatus('not_seeking')} className="w-full py-2 text-left px-4 rounded hover:bg-gray-50 flex items-center">
                  <span className="mr-2">🚫</span> Not Seeking
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
