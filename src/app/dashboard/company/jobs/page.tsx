'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Job {
  id: string;
  titleEn: string;
  status: string;
  vacancies: number;
  createdAt: string;
  applicantCount: number;
  sector: string;
  employmentType: string;
}

export default function CompanyJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchJobs(token);
  }, [router]);

  const fetchJobs = async (token: string) => {
    try {
      const response = await fetch('/api/companies/jobs', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setJobs(data.data);
      }
    } catch (error) {
      console.error('Error fetching company jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (jobId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'expired' : 'active';
    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`/api/jobs/${jobId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) fetchJobs(token!);
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <a href="/dashboard/company" className="text-gray-600 hover:text-gray-900">← Back</a>
            <div className="w-1 h-6 bg-gray-300"></div>
            <h1 className="text-xl font-bold">Manage Job Postings</h1>
          </div>
          <a href="/dashboard/company/post-job" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            + Post New Job
          </a>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">💼</div>
            <h2 className="text-2xl font-bold mb-2">No jobs posted yet</h2>
            <p className="text-gray-600 mb-6">Start your recruitment journey by posting your first job opportunity.</p>
            <a href="/dashboard/company/post-job" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
              Post Your First Job
            </a>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicants</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Posted Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{job.titleEn}</div>
                      <div className="text-xs text-gray-500">{job.sector} • {job.employmentType}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${job.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <a href={`/dashboard/company/jobs/${job.id}/applicants`} className="text-blue-600 hover:underline font-semibold">
                        {job.applicantCount} Applicants
                      </a>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleToggleStatus(job.id, job.status)} className="text-gray-600 hover:text-blue-600 text-sm">
                        {job.status === 'active' ? 'Close' : 'Reopen'}
                      </button>
                      <button onClick={() => router.push(`/dashboard/company/jobs/${job.id}/edit`)} className="text-gray-600 hover:text-blue-600 text-sm font-medium">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
