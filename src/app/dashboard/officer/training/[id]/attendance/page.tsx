'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';

interface AttendanceRecord {
  id: string;
  attended: boolean;
  notes: string;
  trainee: {
    id: string;
    fullName: string;
    program: string;
  };
}

export default function SessionAttendancePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: sessionId } = use(params);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [sessionTitle, setSessionTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    fetchAttendance(token);
  }, [sessionId]);

  const fetchAttendance = async (token: string) => {
    try {
      const response = await fetch(`/api/officer/training/${sessionId}/attendance`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setRecords(data.data);
        setSessionTitle(data.sessionTitle);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = async (traineeId: string, current: boolean) => {
    const token = localStorage.getItem('accessToken');
    try {
      await fetch(`/api/officer/training/${sessionId}/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ traineeId, attended: !current }),
      });
      fetchAttendance(token!);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b p-4">
        <div className="container mx-auto flex items-center space-x-3">
          <button onClick={() => router.back()} className="text-gray-600">← Back</button>
          <h1 className="text-xl font-bold">Attendance: {sessionTitle}</h1>
        </div>
      </header>

      <div className="container mx-auto p-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Trainee Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Program</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {records.map((r) => (
                <tr key={r.trainee.id}>
                  <td className="px-6 py-4 font-medium">{r.trainee.fullName}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{r.trainee.program}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${r.attended ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {r.attended ? 'Present' : 'Absent'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => toggleAttendance(r.trainee.id, r.attended)}
                      className="text-blue-600 font-bold hover:underline"
                    >
                      Mark as {r.attended ? 'Absent' : 'Present'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
