'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Institution {
  id: string;
  nameEn: string;
  region: string;
  city: string;
  moeCode: string;
}

export default function AdminInstitutions() {
  const router = useRouter();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nameEn: '', region: '', city: '', moeCode: '' });

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    const token = localStorage.getItem('accessToken');
    const res = await fetch('/api/admin/institutions', { headers: { 'Authorization': `Bearer ${token}` }});
    const data = await res.json();
    if (data.success) setInstitutions(data.data);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    const res = await fetch('/api/admin/institutions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      setShowForm(false);
      fetchInstitutions();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Institution Federation</h1>
          <button onClick={() => setShowForm(true)} className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold">Add New College</button>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Register TVET College</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <input required placeholder="Institution Name (English)" value={formData.nameEn} onChange={e => setFormData({...formData, nameEn: e.target.value})} className="w-full border p-2 rounded"/>
                <input required placeholder="MoE Code" value={formData.moeCode} onChange={e => setFormData({...formData, moeCode: e.target.value})} className="w-full border p-2 rounded"/>
                <div className="grid grid-cols-2 gap-4">
                  <input required placeholder="Region" value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} className="w-full border p-2 rounded"/>
                  <input required placeholder="City" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full border p-2 rounded"/>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <button type="button" onClick={() => setShowForm(false)} className="text-gray-500">Cancel</button>
                  <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded">Save Institution</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {institutions.map(inst => (
            <div key={inst.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold">{inst.nameEn}</h3>
              <p className="text-sm text-gray-500 mb-4">{inst.city}, {inst.region}</p>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-purple-600">MoE: {inst.moeCode}</span>
                <button className="text-gray-400 hover:text-purple-600 font-bold">Edit Settings</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
