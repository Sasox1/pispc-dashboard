'use client';

import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      const res = await fetch('/api/dashboard');
      const json = await res.json();
      setData(json.data || []);
      setLoading(false);
    }
    fetchDashboard();
  }, []);

  if (loading) return <p>جارٍ التحميل...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>لوحة التحكم - توزيع العمولات</h1>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            {data[0]?.map((col, idx) => <th key={idx}>{col}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.slice(1).map((row, idx) => (
            <tr key={idx}>
              {row.map((cell, j) => <td key={j}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
