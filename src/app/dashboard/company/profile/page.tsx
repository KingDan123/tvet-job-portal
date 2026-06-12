'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CompanyProfileSettings() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    sector: '',
    sizeRange: '',
    city: '',
    address: '',
    website: '',
    description: '',
    tinNumber: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchProfile(token);
  }, []);

  const fetchProfile = async (token: string) => {
    try {
      const response = await fetch('/api/companies/me', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setFormData({
          name: data.data.name || '',
          sector: data.data.sector || '',
          sizeRange: data.data.sizeRange || '',
          city: data.data.city || '',
          address: data.data.address || '',
          website: data.data.website || '',
          description: data.data.description || '',
          tinNumber: data.data.tinNumber || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');

    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch('/api/companies/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center space-x-3 mb-6">
          <a href="/dashboard/company" className="text-gray-600 hover:text-gray-900">← Back</a>
          <h1 className="text-3xl font-bold">Company Profile Settings</h1>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <span className="mr-2">✅</span> {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8 space-y-8">
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Business Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Legal Company Name *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID (TIN Number)</label>
                <input type="text" value={formData.tinNumber} onChange={(e) => setFormData({...formData, tinNumber: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry Sector</label>
                <select value={formData.sector} onChange={(e) => setFormData({...formData, sector: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600">
                  <option value="">Select Industry</option>
                  <option value="Construction">Construction</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="IT">IT & Tech</option>
                  <option value="Hospitality">Hospitality</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
                <select value={formData.sizeRange} onChange={(e) => setFormData({...formData, sizeRange: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600">
                  <option value="">Select Size</option>
                  <option value="1-10">Micro (1-10)</option>
                  <option value="11-50">Small (11-50)</option>
                  <option value="51-200">Medium (51-200)</option>
                  <option value="201+">Large (200+)</option>
                </select>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Contact & Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Headquarters City</label>
                <input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                <input type="url" value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} placeholder="https://..." className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600"/>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Office Address</label>
              <textarea rows={2} value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600"></textarea>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2">About the Company</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Description</label>
              <textarea rows={5} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600" placeholder="Brief overview of what your company does..."></textarea>
            </div>
          </section>

          <div className="flex justify-end pt-6">
            <button type="submit" disabled={saving} className="px-10 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50">
              {saving ? 'Saving...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
