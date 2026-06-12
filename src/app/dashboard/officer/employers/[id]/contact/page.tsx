'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';

export default function LogEmployerContactPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: companyId } = use(params);
  const [companyName, setCompanyName] = useState('');
  const [formData, setFormData] = useState({
    contactType: 'visit',
    notes: '',
    outcome: '',
    nextFollowupAt: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    fetch(`/api/officer/employers/${companyId}`, { headers: { 'Authorization': `Bearer ${token}` }})
      .then(res => res.json())
      .then(data => { if(data.success) setCompanyName(data.data.name); });
  }, [companyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch(`/api/officer/employers/${companyId}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (res.ok) router.push('/dashboard/officer/employers');
    } catch (error) { console.error(error); }
    finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Log Contact: {companyName}</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Contact Type</label>
            <select value={formData.contactType} onChange={e => setFormData({...formData, contactType: e.target.value})} className="w-full border rounded-lg p-2">
              <option value="visit">Site Visit</option>
              <option value="call">Phone Call</option>
              <option value="email">Email correspondence</option>
              <option value="meeting">Formal Meeting</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Discussion Notes</label>
            <textarea rows={4} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full border rounded-lg p-2" placeholder="What did you discuss?"></textarea>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Outcome</label>
            <input type="text" value={formData.outcome} onChange={e => setFormData({...formData, outcome: e.target.value})} className="w-full border rounded-lg p-2" placeholder="e.g., Company agreed to hire 5 welders"/>
          </div>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={() => router.back()} className="text-gray-500">Cancel</button>
            <button type="submit" disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">
              {saving ? 'Logging...' : 'Save Interaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
