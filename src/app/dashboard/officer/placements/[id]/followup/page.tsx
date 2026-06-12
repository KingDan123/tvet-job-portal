'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';

export default function RecordFollowupPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: placementId } = use(params);
  const [formData, setFormData] = useState({
    followupDay: 30,
    traineeSatisfaction: 5,
    employerSatisfaction: 5,
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('accessToken');
    try {
      await fetch(`/api/officer/placements/${placementId}/followups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      router.push('/dashboard/officer/placements');
    } catch (error) { console.error(error); }
    finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Record Supervision Follow-up</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Check-in Milestone</label>
            <select value={formData.followupDay} onChange={e => setFormData({...formData, followupDay: parseInt(e.target.value)})} className="w-full border p-3 rounded-lg">
              <option value="30">30 Day Check-in</option>
              <option value="60">60 Day Check-in</option>
              <option value="90">90 Day Check-in</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Trainee Satisfaction (1-5)</label>
              <input type="number" min="1" max="5" value={formData.traineeSatisfaction} onChange={e => setFormData({...formData, traineeSatisfaction: parseInt(e.target.value)})} className="w-full border p-3 rounded-lg"/>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Employer Satisfaction (1-5)</label>
              <input type="number" min="1" max="5" value={formData.employerSatisfaction} onChange={e => setFormData({...formData, employerSatisfaction: parseInt(e.target.value)})} className="w-full border p-3 rounded-lg"/>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Supervision Notes</label>
            <textarea rows={4} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full border p-3 rounded-lg" placeholder="Is the graduate performing well? Are there any issues?"></textarea>
          </div>

          <div className="flex justify-end space-x-4">
            <button type="button" onClick={() => router.back()} className="text-gray-500">Cancel</button>
            <button type="submit" disabled={saving} className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold">
              {saving ? 'Saving...' : 'Complete Follow-up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
