'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ReportsPage() {
  const router = useRouter();
  const [reportType, setReportType] = useState('placement');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }
  }, [router]);

  const handleGenerateReport = async () => {
    setGenerating(true);
    const token = localStorage.getItem('accessToken');

    try {
      const response = await fetch('/api/officer/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: reportType,
          startDate: dateRange.start,
          endDate: dateRange.end,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}-report-${dateRange.start}-${dateRange.end}.pdf`;
        a.click();
      } else {
        alert('Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Network error');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <a href="/dashboard/officer" className="text-gray-600 hover:text-gray-900">
              ← Back
            </a>
            <div className="w-1 h-6 bg-gray-300"></div>
            <h1 className="text-xl font-bold">FLW-10: Documentation & Reports</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold mb-6">Generate Report</h2>

            <div className="space-y-6">
              {/* Report Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Report Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      value: 'placement',
                      label: 'Placement Report',
                      description: 'Graduate placements and success rates',
                      icon: '💼',
                    },
                    {
                      value: 'training',
                      label: 'Training Report',
                      description: 'Training sessions and attendance',
                      icon: '🎓',
                    },
                    {
                      value: 'referrals',
                      label: 'Referrals Report',
                      description: 'Referral letters and outcomes',
                      icon: '📄',
                    },
                    {
                      value: 'moe',
                      label: 'MoE Export',
                      description: 'Ministry of Education format',
                      icon: '🏛️',
                    },
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setReportType(type.value)}
                      className={`text-left p-4 border-2 rounded-lg transition ${
                        reportType === type.value
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-3xl">{type.icon}</div>
                        <div className="flex-1">
                          <div className="font-semibold mb-1">{type.label}</div>
                          <div className="text-sm text-gray-600">{type.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Date Range
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">End Date</label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Presets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Quick Presets
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Last 7 Days', days: 7 },
                    { label: 'Last 30 Days', days: 30 },
                    { label: 'Last 3 Months', days: 90 },
                    { label: 'Last 6 Months', days: 180 },
                    { label: 'This Year', days: 365 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => {
                        const end = new Date();
                        const start = new Date();
                        start.setDate(start.getDate() - preset.days);
                        setDateRange({
                          start: start.toISOString().split('T')[0],
                          end: end.toISOString().split('T')[0],
                        });
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <div className="flex space-x-4 pt-4">
                <button
                  onClick={handleGenerateReport}
                  disabled={generating}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {generating ? 'Generating...' : '📥 Generate & Download PDF'}
                </button>
              </div>
            </div>
          </div>

          {/* Recent Reports */}
          <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
            <h3 className="text-lg font-bold mb-4">Recent Reports</h3>
            <div className="space-y-3">
              {[
                { name: 'Placement Report - December 2025', date: '2025-12-31', size: '245 KB' },
                { name: 'MoE Export - Q4 2025', date: '2025-12-15', size: '412 KB' },
                { name: 'Training Report - November 2025', date: '2025-11-30', size: '189 KB' },
              ].map((report, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">📄</div>
                    <div>
                      <div className="font-medium">{report.name}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(report.date).toLocaleDateString()} • {report.size}
                      </div>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Info Panel */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6">
            <h3 className="font-semibold text-blue-900 mb-3">📋 Report Guidelines (FLW-10)</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Reports are generated in PDF format for easy sharing</li>
              <li>• MoE Export follows official Ministry of Education format</li>
              <li>• All data is filtered by selected date range</li>
              <li>• Reports include charts, tables, and summary statistics</li>
              <li>• Keep reports as documentation for audit trail</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
