'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const token = localStorage.getItem('accessToken');
    const res = await fetch('/api/admin/settings', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) setSettings(data.data);
    setLoading(false);
  };

  const handleUpdate = async (key: string, value: string) => {
    setSaving(true);
    const token = localStorage.getItem('accessToken');
    await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ key, value }),
    });
    setSaving(false);
    fetchSettings();
  };

  if (loading) return <div className="p-12 text-center font-bold text-purple-600">Loading system master records...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">System Master Controls</h1>
          <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Administrative Core Setup</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {settings.map((s) => (
            <div key={s.id} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-black text-gray-400 uppercase mb-1">{s.key.replace(/_/g, ' ')}</h3>
                <p className="text-gray-600 font-medium mb-4">{s.description || 'Global system variable'}</p>
                <div className="flex items-center space-x-4">
                  {s.key.includes('MAINTENANCE') ? (
                    <button 
                      onClick={() => handleUpdate(s.key, s.value === 'true' ? 'false' : 'true')}
                      className={`px-6 py-2 rounded-full font-bold transition-all ${s.value === 'true' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}
                    >
                      {s.value === 'true' ? 'DISABLE MAINTENANCE' : 'ENABLE MAINTENANCE'}
                    </button>
                  ) : (
                    <input 
                      defaultValue={s.value}
                      onBlur={(e) => handleUpdate(s.key, e.target.value)}
                      className="border-2 border-gray-100 p-2 rounded-lg focus:border-purple-500 outline-none w-64"
                    />
                  )}
                </div>
              </div>
              <div className="text-right ml-8">
                 <div className="text-[40px] opacity-20 grayscale">⚙️</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-purple-900 p-10 rounded-3xl text-white shadow-2xl shadow-purple-200">
           <h2 className="text-2xl font-black mb-4">Architecture Audit Log</h2>
           <p className="opacity-70 mb-6 font-medium">All administrative overrides and system changes are logged with IP tracking for national security compliance.</p>
           <button onClick={() => router.push('/dashboard/admin/audit')} className="bg-white text-purple-900 px-8 py-3 rounded-xl font-black hover:bg-purple-50 transition-all">VIEW AUDIT TRAIL</button>
        </div>
      </div>
    </div>
  );
}
