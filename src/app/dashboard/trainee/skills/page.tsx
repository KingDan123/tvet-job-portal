'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Skill {
  id: string;
  nameEn: string;
  category: string;
  proficiencyLevel?: number;
}

export default function SkillsManagementPage() {
  const router = useRouter();
  const [mySkills, setMySkills] = useState<Skill[]>([]);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetchSkills(token);
  }, [router]);

  const fetchSkills = async (token: string) => {
    try {
      const [mySkillsRes, allSkillsRes] = await Promise.all([
        fetch('/api/trainees/skills', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('/api/skills', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      const mySkillsData = await mySkillsRes.json();
      const allSkillsData = await allSkillsRes.json();

      if (mySkillsData.success) {
        setMySkills(mySkillsData.data);
      }

      if (allSkillsData.success) {
        setAvailableSkills(allSkillsData.data);
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async (skillId: string, proficiency: number) => {
    const token = localStorage.getItem('accessToken');

    try {
      const response = await fetch('/api/trainees/skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ skillId, proficiencyLevel: proficiency }),
      });

      const data = await response.json();
      if (data.success) {
        fetchSkills(token!);
      }
    } catch (error) {
      console.error('Error adding skill:', error);
    }
  };

  const handleRemoveSkill = async (skillId: string) => {
    const token = localStorage.getItem('accessToken');

    try {
      const response = await fetch(`/api/trainees/skills/${skillId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        fetchSkills(token!);
      }
    } catch (error) {
      console.error('Error removing skill:', error);
    }
  };

  const filteredSkills = availableSkills.filter(skill => {
    const matchesSearch = skill.nameEn.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory;
    const notAlreadyAdded = !mySkills.find(s => s.id === skill.id);
    return matchesSearch && matchesCategory && notAlreadyAdded;
  });

  const categories = [...new Set(availableSkills.map(s => s.category))];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <a href="/dashboard/trainee" className="text-gray-600 hover:text-gray-900">
              ← Back
            </a>
            <div className="w-1 h-6 bg-gray-300"></div>
            <h1 className="text-xl font-bold">My Skills</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Why Skills Matter</h3>
            <p className="text-sm text-blue-700">
              Employers use skills to filter candidates. Adding more relevant skills increases your match score
              and helps you appear in more job searches.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* My Skills */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">
                My Skills ({mySkills.length})
              </h2>

              {mySkills.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-3">🎯</div>
                  <p className="text-gray-600">No skills added yet</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Add skills from the list to increase your profile strength
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {mySkills.map((skill) => (
                    <div
                      key={skill.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{skill.nameEn}</div>
                        <div className="text-sm text-gray-600">{skill.category}</div>
                        {skill.proficiencyLevel && (
                          <div className="flex items-center mt-2">
                            <div className="text-xs text-gray-600 mr-2">Proficiency:</div>
                            <div className="flex space-x-1">
                              {[1, 2, 3, 4, 5].map((level) => (
                                <div
                                  key={level}
                                  className={`w-4 h-4 rounded-full ${
                                    level <= skill.proficiencyLevel!
                                      ? 'bg-blue-600'
                                      : 'bg-gray-200'
                                  }`}
                                ></div>
                              ))}
                            </div>
                            <div className="text-xs text-gray-600 ml-2">
                              {skill.proficiencyLevel}/5
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveSkill(skill.id)}
                        className="ml-4 px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Skills */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Add Skills</h2>

              {/* Search & Filter */}
              <div className="space-y-3 mb-4">
                <input
                  type="text"
                  placeholder="Search skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                />

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Available Skills */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredSkills.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No skills found</p>
                  </div>
                ) : (
                  filteredSkills.map((skill) => (
                    <div
                      key={skill.id}
                      className="p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-medium">{skill.nameEn}</div>
                          <div className="text-xs text-gray-600">{skill.category}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-600">Proficiency:</span>
                        {[1, 2, 3, 4, 5].map((level) => (
                          <button
                            key={level}
                            onClick={() => handleAddSkill(skill.id, level)}
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Skill Categories Info */}
          <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
            <h3 className="font-semibold mb-4">Understanding Skill Categories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="font-medium text-blue-900 mb-2">🔧 Technical Skills</div>
                <div className="text-sm text-blue-700">
                  Job-specific skills you learned in your TVET program (welding, plumbing, etc.)
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="font-medium text-green-900 mb-2">💬 Soft Skills</div>
                <div className="text-sm text-green-700">
                  Transferable skills like communication, teamwork, problem-solving
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="font-medium text-purple-900 mb-2">💻 Digital Skills</div>
                <div className="text-sm text-purple-700">
                  Computer literacy, software tools, digital communication
                </div>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="font-medium text-orange-900 mb-2">🌍 Language Skills</div>
                <div className="text-sm text-orange-700">
                  Languages you can speak, read, or write
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
