'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PostJobPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    titleEn: '',
    titleAm: '',
    sector: '',
    descriptionEn: '',
    descriptionAm: '',
    employmentType: 'full',
    vacancies: 1,
    locationRegion: 'Addis Ababa',
    locationCity: '',
    salaryMin: 0,
    salaryMax: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        router.push('/dashboard/company/jobs');
      } else {
        setError(data.error || 'Failed to post job');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center space-x-3 mb-6">
          <a href="/dashboard/company/jobs" className="text-gray-600 hover:text-gray-900">← Cancel</a>
          <h1 className="text-3xl font-bold">Post a New Job</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title (English) *</label>
              <input type="text" required value={formData.titleEn} onChange={(e) => setFormData({...formData, titleEn: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title (Amharic)</label>
              <input type="text" value={formData.titleAm} onChange={(e) => setFormData({...formData, titleAm: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sector *</label>
              <select required value={formData.sector} onChange={(e) => setFormData({...formData, sector: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600">
                <option value="">Select Sector</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Construction">Construction</option>
                <option value="Hospitality">Hospitality</option>
                <option value="IT">Information Technology</option>
                <option value="Automotive">Automotive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type *</label>
              <select value={formData.employmentType} onChange={(e) => setFormData({...formData, employmentType: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600">
                <option value="full">Full Time</option>
                <option value="part">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Description (English) *</label>
            <textarea required rows={5} value={formData.descriptionEn} onChange={(e) => setFormData({...formData, descriptionEn: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600"></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Vacancies</label>
              <input type="number" min={1} value={formData.vacancies} onChange={(e) => setFormData({...formData, vacancies: parseInt(e.target.value)})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
              <select value={formData.locationRegion} onChange={(e) => setFormData({...formData, locationRegion: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600">
                <option value="Addis Ababa">Addis Ababa</option>
                <option value="Oromia">Oromia</option>
                <option value="Amhara">Amhara</option>
                <option value="Tigray">Tigray</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input type="text" value={formData.locationCity} onChange={(e) => setFormData({...formData, locationCity: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600"/>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button type="button" onClick={() => router.back()} className="px-6 py-2 text-gray-600 hover:text-gray-900">Cancel</button>
            <button type="submit" disabled={loading} className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
              {loading ? 'Posting...' : 'Post Job opportunity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
