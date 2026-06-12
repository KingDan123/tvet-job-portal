'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  institution: { nameEn: string } | null;
}

export default function AdminUserManagement() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    fetchUsers(token);
  }, []);

  const fetchUsers = async (token: string) => {
    try {
      const response = await fetch(`/api/admin/users?search=${search}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) setUsers(data.data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const toggleStatus = async (userId: string, current: boolean) => {
    const token = localStorage.getItem('accessToken');
    try {
      await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ isActive: !current }),
      });
      fetchUsers(token!);
    } catch (error) { console.error(error); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <a href="/dashboard/admin" className="text-gray-600">← Back</a>
            <h1 className="text-xl font-bold text-purple-700">User Management Control</h1>
          </div>
          <div className="flex space-x-2">
            <input 
              type="text" 
              placeholder="Search by email..." 
              className="border rounded-lg px-4 py-2 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchUsers(localStorage.getItem('accessToken')!)}
            />
            <button onClick={() => fetchUsers(localStorage.getItem('accessToken')!)} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Search</button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">User Email</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Institution</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-6 py-4 font-medium">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold uppercase">{u.role}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{u.institution?.nameEn || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {u.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => toggleStatus(u.id, u.isActive)}
                      className={`text-xs font-bold px-3 py-1 rounded ${u.isActive ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}
                    >
                      {u.isActive ? 'Suspend' : 'Activate'}
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
