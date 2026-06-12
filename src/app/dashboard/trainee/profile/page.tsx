'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Profile {
  fullName: string;
  gender: string;
  birthDate: string;
  region: string;
  zone: string;
  woreda: string;
  studentId: string;
  program: string;
  level: number;
  graduationYear: number;
  gpa: string;
  employmentStatus: string;
  bio: string;
  profileCompletePct: number;
  user: {
    email: string;
    phone: string;
    languagePref: string;
  };
}

export default function TraineeProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetchProfile(token);
  }, [router]);

  const fetchProfile = async (token: string) => {
    try {
      const response = await fetch('/api/trainees/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setProfile(data.data);
        setFormData({
          fullName: data.data.fullName || '',
          gender: data.data.gender || '',
          birthDate: data.data.birthDate ? new Date(data.data.birthDate).toISOString().split('T')[0] : '',
          region: data.data.region || '',
          zone: data.data.zone || '',
          woreda: data.data.woreda || '',
          studentId: data.data.studentId || '',
          program: data.data.program || '',
          level: data.data.level || 3,
          graduationYear: data.data.graduationYear || new Date().getFullYear(),
          gpa: data.data.gpa || '',
          employmentStatus: data.data.employmentStatus || 'seeking',
          bio: data.data.bio || '',
          phone: data.data.user.phone || '',
          languagePref: data.data.user.languagePref || 'en',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setSaving(true);

    const token = localStorage.getItem('accessToken');

    try {
      const response = await fetch('/api/trainees/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Profile updated successfully!');
        setProfile({ ...profile!, ...formData, profileCompletePct: data.data.profileCompletePct });
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

  const regions = [
    'Addis Ababa', 'Oromia', 'Amhara', 'Tigray', 'Somali',
    'Afar', 'SNNPR', 'Benishangul-Gumuz', 'Gambela', 'Harari', 'Dire Dawa'
  ];

  const programs = [
    'Automotive Technology',
    'Electrical Installation',
    'Computer Maintenance',
    'Plumbing',
    'Welding and Metal Fabrication',
    'Construction Technology',
    'Hospitality Management',
    'Beauty and Cosmetology',
    'Garment and Textile',
    'Furniture Making',
    'Accounting',
    'Secretarial Science',
    'Agricultural Mechanics',
    'Food Processing',
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <a href="/dashboard/trainee" className="text-gray-600 hover:text-gray-900">
              ← Back to Dashboard
            </a>
            <div className="w-1 h-6 bg-gray-300"></div>
            <h1 className="text-xl font-bold">My Profile</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Completion Banner */}
          {profile && profile.profileCompletePct < 100 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Complete Your Profile</h3>
                  <p className="text-sm text-blue-700">
                    A complete profile increases your chances of getting hired by 3x!
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    {profile.profileCompletePct}%
                  </div>
                  <div className="text-xs text-blue-700">Complete</div>
                </div>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${profile.profileCompletePct}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              {success}
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm mb-6">
            <div className="border-b border-gray-200">
              <div className="flex space-x-1 p-2">
                {[
                  { id: 'personal', label: 'Personal Info', icon: '👤' },
                  { id: 'education', label: 'Education', icon: '🎓' },
                  { id: 'employment', label: 'Employment', icon: '💼' },
                  { id: 'settings', label: 'Settings', icon: '⚙️' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {/* Personal Info Tab */}
              {activeTab === 'personal' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold mb-4">Personal Information</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                        placeholder="+251..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Region *
                      </label>
                      <select
                        value={formData.region}
                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="">Select region</option>
                        {regions.map((region) => (
                          <option key={region} value={region}>{region}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Zone
                      </label>
                      <input
                        type="text"
                        value={formData.zone}
                        onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                        placeholder="Enter zone"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Woreda
                      </label>
                      <input
                        type="text"
                        value={formData.woreda}
                        onChange={(e) => setFormData({ ...formData, woreda: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                        placeholder="Enter woreda"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio / About Me
                    </label>
                    <textarea
                      rows={4}
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                      placeholder="Tell employers about yourself, your skills, and career goals..."
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {formData.bio?.length || 0} / 500 characters
                    </div>
                  </div>
                </div>
              )}

              {/* Education Tab */}
              {activeTab === 'education' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold mb-4">Education & Training</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Student ID
                      </label>
                      <input
                        type="text"
                        value={formData.studentId}
                        onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                        placeholder="Enter your student ID"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Program / Field of Study *
                      </label>
                      <select
                        value={formData.program}
                        onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="">Select program</option>
                        {programs.map((program) => (
                          <option key={program} value={program}>{program}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        TVET Level *
                      </label>
                      <select
                        value={formData.level}
                        onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="">Select level</option>
                        <option value="1">Level 1</option>
                        <option value="2">Level 2</option>
                        <option value="3">Level 3</option>
                        <option value="4">Level 4</option>
                        <option value="5">Level 5</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Graduation Year *
                      </label>
                      <input
                        type="number"
                        min="2010"
                        max="2030"
                        value={formData.graduationYear}
                        onChange={(e) => setFormData({ ...formData, graduationYear: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        GPA (Optional)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="4"
                        value={formData.gpa}
                        onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                        placeholder="e.g., 3.45"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">💡 Pro Tip</h3>
                    <p className="text-sm text-blue-700">
                      Employers filter candidates by program and level. Make sure these fields are accurate!
                    </p>
                  </div>
                </div>
              )}

              {/* Employment Tab */}
              {activeTab === 'employment' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold mb-4">Employment Preferences</h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Employment Status *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { value: 'seeking', label: 'Seeking Employment', icon: '🔍', desc: 'Actively looking for jobs' },
                        { value: 'employed', label: 'Currently Employed', icon: '💼', desc: 'Have a job now' },
                        { value: 'not_seeking', label: 'Not Seeking', icon: '🚫', desc: 'Not looking for work' },
                      ].map((status) => (
                        <button
                          key={status.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, employmentStatus: status.value })}
                          className={`p-4 border-2 rounded-lg text-left transition ${
                            formData.employmentStatus === status.value
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-3xl mb-2">{status.icon}</div>
                          <div className="font-semibold mb-1">{status.label}</div>
                          <div className="text-sm text-gray-600">{status.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {formData.employmentStatus === 'seeking' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <h3 className="font-semibold text-green-900 mb-3">🎯 Get Matched with Jobs</h3>
                      <p className="text-sm text-green-700 mb-4">
                        Our smart matching algorithm will automatically find jobs that match your:
                      </p>
                      <ul className="space-y-2 text-sm text-green-700">
                        <li className="flex items-center">
                          <span className="text-green-600 mr-2">✓</span>
                          Field of study and program
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-600 mr-2">✓</span>
                          Skills and competencies
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-600 mr-2">✓</span>
                          Preferred location (region)
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-600 mr-2">✓</span>
                          Experience level
                        </li>
                      </ul>
                    </div>
                  )}

                  {formData.employmentStatus === 'employed' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h3 className="font-semibold text-blue-900 mb-3">💼 Already Employed?</h3>
                      <p className="text-sm text-blue-700 mb-4">
                        Great! You can still:
                      </p>
                      <ul className="space-y-2 text-sm text-blue-700">
                        <li className="flex items-center">
                          <span className="text-blue-600 mr-2">•</span>
                          Browse better opportunities
                        </li>
                        <li className="flex items-center">
                          <span className="text-blue-600 mr-2">•</span>
                          Update your profile for future openings
                        </li>
                        <li className="flex items-center">
                          <span className="text-blue-600 mr-2">•</span>
                          Help us improve by sharing feedback
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold mb-4">Account Settings</h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profile?.user.email}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Email cannot be changed. Contact support if needed.
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Language
                    </label>
                    <select
                      value={formData.languagePref}
                      onChange={(e) => setFormData({ ...formData, languagePref: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="en">English</option>
                      <option value="am">አማርኛ (Amharic)</option>
                      <option value="om">Afaan Oromo</option>
                    </select>
                    <div className="text-xs text-gray-500 mt-1">
                      This affects the language of the interface and notifications
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Privacy Settings</h3>
                    
                    <div className="space-y-4">
                      <label className="flex items-start">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="mt-1 mr-3"
                        />
                        <div>
                          <div className="font-medium">Allow ILJC officers to refer me</div>
                          <div className="text-sm text-gray-600">
                            Employment officers can send your profile to employers
                          </div>
                        </div>
                      </label>

                      <label className="flex items-start">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="mt-1 mr-3"
                        />
                        <div>
                          <div className="font-medium">Receive job recommendations</div>
                          <div className="text-sm text-gray-600">
                            Get notified when jobs match your profile
                          </div>
                        </div>
                      </label>

                      <label className="flex items-start">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="mt-1 mr-3"
                        />
                        <div>
                          <div className="font-medium">Training session invitations</div>
                          <div className="text-sm text-gray-600">
                            Receive invites for pre-employment training
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Danger Zone</h3>
                    
                    <button
                      type="button"
                      className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition"
                    >
                      Delete My Account
                    </button>
                    <div className="text-xs text-gray-500 mt-2">
                      This action cannot be undone. All your data will be permanently deleted.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Profile Completion:</span> {profile?.profileCompletePct}%
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/trainee')}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
