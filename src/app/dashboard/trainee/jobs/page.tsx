'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Job {
  id: string;
  titleEn: string;
  descriptionEn: string;
  sector: string;
  locationRegion: string;
  locationCity: string;
  employmentType: string;
  vacancies: number;
  createdAt: string;
  company: {
    name: string;
    city: string;
    employerBadge: string;
  };
}

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    sector: '',
    region: '',
    employmentType: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetchJobs();
  }, [router]);

  const fetchJobs = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.sector) params.append('sector', filters.sector);
      if (filters.region) params.append('region', filters.region);
      if (filters.employmentType) params.append('employmentType', filters.employmentType);

      const response = await fetch(`/api/jobs?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setJobs(data.data);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId: string) => {
    const token = localStorage.getItem('accessToken');
    
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ jobId }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Application submitted successfully!');
        router.push('/dashboard/trainee/applications');
      } else {
        alert(data.error || 'Failed to submit application');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <a href="/dashboard/trainee" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">TV</span>
                </div>
                <span className="text-xl font-bold">TVET Hub</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Browse Jobs</h1>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search jobs..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            />
            <select
              value={filters.sector}
              onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            >
              <option value="">All Sectors</option>
              <option value="Construction">Construction</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Hospitality">Hospitality</option>
              <option value="Automotive">Automotive</option>
            </select>
            <select
              value={filters.region}
              onChange={(e) => setFilters({ ...filters, region: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            >
              <option value="">All Regions</option>
              <option value="Addis Ababa">Addis Ababa</option>
              <option value="Oromia">Oromia</option>
              <option value="Amhara">Amhara</option>
            </select>
            <button
              onClick={fetchJobs}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="text-center py-12">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold mb-2">No jobs found</h2>
            <p className="text-gray-600">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h2 className="text-2xl font-bold">{job.titleEn}</h2>
                      {job.company.employerBadge === 'verified' && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 mb-3">{job.company.name} · {job.company.city}</p>
                    <p className="text-gray-600 mb-4 line-clamp-2">{job.descriptionEn}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.sector && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {job.sector}
                        </span>
                      )}
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {job.employmentType}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        📍 {job.locationRegion}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {job.vacancies} {job.vacancies === 1 ? 'position' : 'positions'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Posted {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleApply(job.id)}
                    className="ml-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
