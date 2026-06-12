'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Graduate {
  id: string;
  fullName: string;
  program: string;
  level: number;
  graduationYear: number;
  gpa: string;
  employmentStatus: string;
  profileCompletePct: number;
  region: string;
  zone: string;
  user: {
    email: string;
    phone: string;
  };
}

export default function GraduateCatalogPage() {
  const router = useRouter();
  const [graduates, setGraduates] = useState<Graduate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    program: '',
    employmentStatus: '',
    graduationYear: '',
    search: '',
  });
  const [selectedGraduates, setSelectedGraduates] = useState<Set<string>>(new Set());

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetchGraduates(token);
  }, [router]);

  const fetchGraduates = async (token: string) => {
    try {
      const params = new URLSearchParams();
      if (filters.program) params.append('program', filters.program);
      if (filters.employmentStatus) params.append('status', filters.employmentStatus);
      if (filters.graduationYear) params.append('year', filters.graduationYear);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`/api/officer/graduates?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setGraduates(data.data);
      }
    } catch (error) {
      console.error('Error fetching graduates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGraduate = (id: string) => {
    const newSelected = new Set(selectedGraduates);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedGraduates(newSelected);
  };

  const handleBulkAction = async (action: string) => {
    if (selectedGraduates.size === 0) {
      alert('Please select at least one graduate');
      return;
    }

    const token = localStorage.getItem('accessToken');
    
    switch (action) {
      case 'training':
        router.push(`/dashboard/officer/training/create?graduates=${Array.from(selectedGraduates).join(',')}`);
        break;
      case 'referral':
        router.push(`/dashboard/officer/referrals/create?graduates=${Array.from(selectedGraduates).join(',')}`);
        break;
      case 'export':
        // Export to CSV
        const csv = generateCSV(graduates.filter(g => selectedGraduates.has(g.id)));
        downloadCSV(csv, 'graduates.csv');
        break;
    }
  };

  const generateCSV = (data: Graduate[]) => {
    const headers = ['Name', 'Program', 'Level', 'Graduation Year', 'GPA', 'Status', 'Email', 'Phone'];
    const rows = data.map(g => [
      g.fullName,
      g.program,
      g.level,
      g.graduationYear,
      g.gpa,
      g.employmentStatus,
      g.user.email,
      g.user.phone || '',
    ]);
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
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
              <h1 className="text-xl font-bold">FLW-1: Graduate Catalog</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <input
              type="text"
              placeholder="Search by name..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            />
            <select
              value={filters.program}
              onChange={(e) => setFilters({ ...filters, program: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            >
              <option value="">All Programs</option>
              <option value="Automotive Technology">Automotive Technology</option>
              <option value="Electrical Installation">Electrical Installation</option>
              <option value="Computer Maintenance">Computer Maintenance</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Welding">Welding</option>
            </select>
            <select
              value={filters.employmentStatus}
              onChange={(e) => setFilters({ ...filters, employmentStatus: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            >
              <option value="">All Statuses</option>
              <option value="seeking">Seeking Employment</option>
              <option value="employed">Employed</option>
              <option value="not_seeking">Not Seeking</option>
            </select>
            <button
              onClick={() => fetchGraduates(localStorage.getItem('accessToken') || '')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Apply Filters
            </button>
          </div>

          {/* Bulk Actions */}
          {selectedGraduates.size > 0 && (
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-blue-900">
                {selectedGraduates.size} selected
              </span>
              <button
                onClick={() => handleBulkAction('training')}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
              >
                Invite to Training
              </button>
              <button
                onClick={() => handleBulkAction('referral')}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
              >
                Create Referral
              </button>
              <button
                onClick={() => handleBulkAction('export')}
                className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition"
              >
                Export CSV
              </button>
              <button
                onClick={() => setSelectedGraduates(new Set())}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>

        {/* Graduates Table */}
        {loading ? (
          <div className="text-center py-12">Loading graduates...</div>
        ) : graduates.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h2 className="text-2xl font-bold mb-2">No graduates found</h2>
            <p className="text-gray-600">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedGraduates(new Set(graduates.map(g => g.id)));
                        } else {
                          setSelectedGraduates(new Set());
                        }
                      }}
                      checked={selectedGraduates.size === graduates.length && graduates.length > 0}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Program
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Grad Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    GPA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Profile
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {graduates.map((graduate) => (
                  <tr key={graduate.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedGraduates.has(graduate.id)}
                        onChange={() => handleSelectGraduate(graduate.id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{graduate.fullName}</div>
                      <div className="text-sm text-gray-500">{graduate.user.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{graduate.program}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">Level {graduate.level}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{graduate.graduationYear}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{graduate.gpa || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          graduate.employmentStatus === 'seeking'
                            ? 'bg-green-100 text-green-700'
                            : graduate.employmentStatus === 'employed'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {graduate.employmentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${graduate.profileCompletePct}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">{graduate.profileCompletePct}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <a
                        href={`/dashboard/officer/graduates/${graduate.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Details
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600">Total Graduates</div>
            <div className="text-2xl font-bold text-gray-900">{graduates.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600">Seeking Employment</div>
            <div className="text-2xl font-bold text-green-600">
              {graduates.filter(g => g.employmentStatus === 'seeking').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600">Employed</div>
            <div className="text-2xl font-bold text-blue-600">
              {graduates.filter(g => g.employmentStatus === 'employed').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600">Avg Profile Completion</div>
            <div className="text-2xl font-bold text-purple-600">
              {graduates.length > 0 
                ? Math.round(graduates.reduce((sum, g) => sum + g.profileCompletePct, 0) / graduates.length)
                : 0}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
