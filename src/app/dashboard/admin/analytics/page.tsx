'use client';

import { useEffect, useState } from 'react';

export default function AdminAnalytics() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    fetch('/api/admin/analytics', { headers: { 'Authorization': `Bearer ${token}` }})
      .then(res => res.json())
      .then(resData => setData(resData.data));
  }, []);

  if (!data) return <div className="p-12 text-center">Crunching system data...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-black mb-8 text-gray-900">Labor Market Intelligence</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sector Breakdown */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6">Placements by Industry Sector</h2>
            <div className="space-y-4">
              {Object.entries(data.bySector).map(([sector, count]: [string, any]) => (
                <div key={sector}>
                  <div className="flex justify-between text-sm mb-1 font-bold">
                    <span>{sector}</span>
                    <span className="text-purple-600">{count} hires</span>
                  </div>
                  <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: `${(count/data.total)*100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regional Demand */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6">Employment Heatmap (Regions)</h2>
            <div className="space-y-4">
              {Object.entries(data.byRegion).map(([region, count]: [string, any]) => (
                <div key={region}>
                  <div className="flex justify-between text-sm mb-1 font-bold">
                    <span>{region}</span>
                    <span className="text-blue-600">{count} placements</span>
                  </div>
                  <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(count/data.total)*100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Trend (Simulated) */}
          <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4 text-center">Year-over-Year Placement Growth</h2>
            <div className="h-64 flex items-end justify-between space-x-2 px-4 border-b">
              {[20, 35, 45, 30, 60, 75, 90, 85, 110, 130, 150, 180].map((h, i) => (
                <div key={i} className="bg-purple-600 w-full rounded-t-lg transition-all hover:bg-purple-700" style={{ height: `${h}%` }}></div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-400 uppercase">
              <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
              <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
