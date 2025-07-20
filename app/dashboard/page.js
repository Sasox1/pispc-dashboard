'use client';

import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('فشل تحميل البيانات:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-6 text-center text-gray-600">جاري تحميل البيانات...</div>;
  }

  if (!Array.isArray(data) || data.length <= 1) {
    return <div className="p-6 text-center text-red-600">لا توجد بيانات متاحة.</div>;
  }

  const headers = data[0];
  const rows = data.slice(1);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">لوحة تحكم المسوق</h1>

      <div className="overflow-auto border rounded-lg shadow-lg">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gray-800 text-white">
            <tr>
              {headers.map((header, idx) => (
                <th key={idx} className="px-4 py-2 border">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className="even:bg-gray-100 odd:bg-white">
                {row.map((cell, i) => (
                  <td key={i} className="px-4 py-2 border text-sm text-center">
                    {cell || '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
