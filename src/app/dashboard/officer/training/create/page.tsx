'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function CreateTrainingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedGraduates = searchParams.get('graduates')?.split(',') || [];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'soft_skill',
    scheduledAt: '',
    duration: 120,
    location: '',
    capacity: 30,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const token = localStorage.getItem('accessToken');

    try {
      const response = await fetch('/api/officer/training', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          inviteGraduates: preselectedGraduates,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/dashboard/officer/training');
      } else {
        setError(data.error || 'Failed to create training session');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <a href="/dashboard/officer/training" className="text-gray-600 hover:text-gray-900">
              ← Back
            </a>
            <div className="w-1 h-6 bg-gray-300"></div>
            <h1 className="text-xl font-bold">Create Training Session (FLW-3)</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold mb-6">Pre-Employment Training Details</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {preselectedGraduates.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6">
                ✓ {preselectedGraduates.length} graduates pre-selected for invitation
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Soft Skills for Employment Success"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="Describe the training objectives and topics..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Training Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                >
                  <option value="soft_skill">Soft Skills (Communication, Teamwork, etc.)</option>
                  <option value="technical">Technical Skills Refresher</option>
                  <option value="orientation">Employment Orientation</option>
                </select>
              </div>

              {/* Schedule */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    required
                    min="30"
                    max="480"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Location & Capacity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Main Hall, Building A"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacity *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="200"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Training Session'}
                </button>
                <a
                  href="/dashboard/officer/training"
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </a>
              </div>
            </form>
          </div>

          {/* Info Panel */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6">
            <h3 className="font-semibold text-blue-900 mb-3">📋 FLW-3 Best Practices</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Schedule training at least 1 week before job referrals</li>
              <li>• Soft skills training improves placement success rate by 40%</li>
              <li>• Track attendance to verify training completion</li>
              <li>• Typical session duration: 2-4 hours for soft skills</li>
              <li>• Invite graduates based on employment readiness (FLW-2)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreateTrainingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    }>
      <CreateTrainingForm />
    </Suspense>
  );
}
