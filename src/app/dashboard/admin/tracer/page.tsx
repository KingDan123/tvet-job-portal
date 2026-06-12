'use client';

import { useState } from 'react';

export default function AdminTracerBuilder() {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<any[]>([]);

  const addQuestion = () => {
    setQuestions([...questions, { id: Date.now(), text: '', type: 'text' }]);
  };

  const handleSave = async () => {
    const token = localStorage.getItem('accessToken');
    await fetch('/api/admin/tracer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ title, questions }),
    });
    alert('Tracer survey published to all employed graduates!');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-black mb-8">Tracer Study Builder</h1>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-500 uppercase mb-2">Survey Title</label>
            <input 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="e.g., 2026 Graduate Employment Survey"
              className="w-full border-2 border-gray-100 p-4 rounded-xl focus:border-purple-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-bold border-b pb-2">Questions</h3>
            {questions.map((q, idx) => (
              <div key={q.id} className="p-4 bg-gray-50 rounded-xl space-y-2">
                <input 
                  placeholder={`Question ${idx + 1}`}
                  value={q.text}
                  onChange={e => {
                    const newQ = [...questions];
                    newQ[idx].text = e.target.value;
                    setQuestions(newQ);
                  }}
                  className="w-full border-none bg-transparent font-bold outline-none"
                />
                <select 
                   value={q.type}
                   onChange={e => {
                    const newQ = [...questions];
                    newQ[idx].type = e.target.value;
                    setQuestions(newQ);
                  }}
                  className="text-xs bg-white border px-2 py-1 rounded"
                >
                  <option value="text">Text Response</option>
                  <option value="rating">Scale (1-5)</option>
                  <option value="boolean">Yes / No</option>
                </select>
              </div>
            ))}
          </div>

          <button onClick={addQuestion} className="w-full border-2 border-dashed border-gray-200 p-4 rounded-xl text-gray-400 hover:border-purple-300 hover:text-purple-600 transition-all font-bold">+ Add Question</button>
          
          <button onClick={handleSave} className="w-full bg-purple-600 text-white p-4 rounded-xl font-black text-lg hover:bg-purple-700 shadow-lg shadow-purple-200">Publish Survey</button>
        </div>
      </div>
    </div>
  );
}
