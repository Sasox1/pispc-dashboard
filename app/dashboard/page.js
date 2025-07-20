// app/dashboard/page.js
'use client';

import { useEffect, useState } from 'react';
import { getSheetData } from '@/utils/sheets';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [dataReady, setDataReady] = useState(false);
  const [marketerId, setMarketerId] = useState(null);
  const [commissions, setCommissions] = useState([]);
  const [myDirectSales, setMyDirectSales] = useState([]);
  const [teamA, setTeamA] = useState([]);
  const [teamB, setTeamB] = useState([]);
  const [error, setError] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const email = localStorage.getItem('email');
    if (!email) {
      router.push('/login');
      return;
    }

    async function loadData() {
      try {
        const [users, commissionsData, pyramid] = await Promise.all([
          getSheetData('المستخدمين', 'A1:D1000'),
          getSheetData('توزيع العمولات', 'A1:L1000'),
          getSheetData('الهرم', 'A1:E1000')
        ]);

        const userRow = users.find((row) => row[3] === email);
        if (!userRow) return router.push('/login');

        const marketerId = userRow[2];
        setMarketerId(marketerId);

        const mySales = commissionsData.filter(row => row[0] === marketerId && row[2] === '✓');
        const teamARows = pyramid.find(row => row[0] === marketerId)?.[2]?.split(',') || [];
        const teamBRows = pyramid.find(row => row[0] === marketerId)?.[3]?.split(',') || [];

        const teamASales = commissionsData.filter(row => teamARows.includes(row[0]) && row[3] === '✓');
        const teamBSales = commissionsData.filter(row => teamBRows.includes(row[0]) && row[4] === '✓');

        setMyDirectSales(mySales);
        setTeamA(teamASales);
        setTeamB(teamBSales);
        setCommissions(commissionsData);
        setDataReady(true);
      } catch (e) {
        setError('فشل في تحميل البيانات');
      }
    }

    loadData();
  }, []);

  if (error) return <div style={{ padding: '2rem' }}>{error}</div>;
  if (!dataReady) return <div style={{ padding: '2rem' }}>جارٍ تحميل البيانات...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>لوحة التحكم</h1>
      <p>رقم المسوق: {marketerId}</p>
      <div>
        <h2>مبيعاتي المباشرة: {myDirectSales.length}</h2>
        <h2>مبيعات الفريق A: {teamA.length}</h2>
        <h2>مبيعات الفريق B: {teamB.length}</h2>
      </div>
      <div>
        {/* لاحقًا نضيف الرسوم البيانية والمربعات القابلة للضغط هنا */}
      </div>
    </div>
  );
}
