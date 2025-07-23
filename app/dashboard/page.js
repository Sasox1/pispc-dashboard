'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';
import GaugeChart from 'react-gauge-chart';
import 'react-circular-progressbar/dist/styles.css';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [debug, setDebug] = useState('');
  const [error, setError] = useState('');
  const [marketerName, setMarketerName] = useState('');
  const [marketerTier, setMarketerTier] = useState('');

  useEffect(() => {
    const marketerId = sessionStorage.getItem('marketerId');
    if (!marketerId) {
      setError('⚠️ لم يتم العثور على بيانات الدخول (marketerId). الرجاء تسجيل الدخول مجددًا.');
      return;
    }

    setDebug(`🔍 تم العثور على المعرف: marketerId = ${marketerId}`);

    fetch('/api/dashboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ marketerId })
    })
      .then(res => {
        if (!res.ok) throw new Error('❌ فشل في تحميل البيانات من API');
        return res.json();
      })
      .then(data => {
        if (!data.stats) {
          setError('❌ لم يتم استلام بيانات صالحة من السيرفر.');
          return;
        }
        setStats(data.stats);
        setMarketerName(data.stats.marketerName || '');
        setMarketerTier(data.stats.marketerLevel || '');
      })
      .catch(err => {
        setError('❌ فشل في تحميل البيانات من السيرفر');
        console.error(err);
      });
  }, []);

  if (error) {
    return <div className="p-8 text-red-600 font-bold whitespace-pre-wrap">{error}{'\n\n'}{debug}</div>;
  }

  if (!stats) {
    return <div className="p-8 text-gray-500 animate-pulse whitespace-pre-wrap">⏳ جاري تحميل البيانات...{'\n\n'}{debug}</div>;
  }

  const chartData = [
    { id: 'بيع مباشر', label: 'بيع مباشر', value: stats.totalDirectCommission },
    { id: 'فريق A', label: 'فريق A', value: stats.totalReferralCommission },
    { id: 'فريق B', label: 'فريق B', value: stats.totalRofRCommission },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden font-sans text-[#E0E0E0]">
      <div className="absolute inset-0 -z-10 bg-[#0c1326]">
        <div className="absolute top-0 left-0 w-[420px] h-[200px] bg-white/40 blur-3xl rounded-full opacity-90 shadow-[0_0_100px_80px_rgba(255,255,255,0.3)] pointer-events-none" />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }} className="relative z-10 p-8 space-y-8">
        <div className="flex items-center justify-between">
          <Image src="/logo.png" alt="PISPC Logo" width={360} height={360} />
          <div className="flex flex-col gap-2">
            <div className="bg-white/10 border border-white/20 shadow px-6 py-3 rounded-xl text-sm">
              <div className="font-bold">{marketerName}</div>
            </div>
            <div className="bg-yellow-300/20 border border-yellow-300/30 shadow px-6 py-2 rounded-xl text-xs text-yellow-300 font-medium">
              {marketerTier}
            </div>
            <div className="flex gap-2 mt-2">
              <MiniCard title="📢 إشعارات" value="0" />
              <MiniCard title="📰 أخبار" value="2" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 border border-[#FFD700]/20 rounded-2xl py-4 px-8 shadow-xl text-center">
          <h1 className="text-lg font-semibold tracking-wide">لوحة تحكم المسوق</h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="أرباح الشهر الحالي" value={`${stats.currentMonthEarnings.toLocaleString()} SP`} />
          <StatCard title="عمولة البيع المباشر" value={`${stats.totalDirectCommission.toLocaleString()} SP`} />
          <StatCard title="عمولة الفريق A" value={`${stats.totalReferralCommission.toLocaleString()} SP`} />
          <StatCard title="عمولة الفريق B" value={`${stats.totalRofRCommission.toLocaleString()} SP`} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <StatCard title="العمولات غير المدفوعة" value={stats.totalPending.toLocaleString()} />
          <StatCard title="عدد ترقياتك" value={stats.upgradeHistory.length} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <StatCard title="🎯 مؤشر الوصول للمكافأة">
            <div className="flex justify-center items-center h-32">
              <GaugeChart
                id="bonus-gauge"
                nrOfLevels={20}
                percent={(stats.bonusProgress || 0) / 100}
                arcPadding={0.03}
                cornerRadius={2}
                textColor="#ffffff"
                arcsLength={[1]}
                colors={["#10B981"]}
                needleColor="#FCD34D"
                animate={false}
                arcWidth={0.3}
                style={{ width: '100%', maxWidth: '200px' }}
              />
            </div>
          </StatCard>
          <StatCard title="🚀 مؤشر الترقية">
            <div className="flex justify-center items-center h-32">
              <GaugeChart
                id="upgrade-gauge"
                nrOfLevels={20}
                percent={(stats.upgradeProgress || 0) / 100}
                arcPadding={0.03}
                cornerRadius={2}
                textColor="#ffffff"
                arcsLength={[1]}
                colors={["#F59E0B"]}
                needleColor="#FCD34D"
                animate={false}
                arcWidth={0.3}
                style={{ width: '100%', maxWidth: '200px' }}
              />
            </div>
          </StatCard>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <StatCard title="📊 توزيع العمولات">
            <div style={{ height: 220 }}>
              <ResponsivePie
                data={chartData}
                colors={{ scheme: 'accent' }}
                margin={{ top: 30, right: 30, bottom: 40, left: 30 }}
                innerRadius={0.5}
                padAngle={1}
                cornerRadius={5}
                activeOuterRadiusOffset={8}
                borderWidth={1}
                borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor="#ccc"
                arcLinkLabelsThickness={2}
                arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
              />
            </div>
          </StatCard>

          <StatCard title="📈 عدد العمولات">
            <div style={{ height: 220 }}>
              <ResponsiveBar
                data={[
                  { name: 'بيع مباشر', count: Number(stats.countDirectCommission) || 0 },
                  { name: 'فريق A', count: Number(stats.countReferralCommission) || 0 },
                  { name: 'فريق B', count: Number(stats.countRofRCommission) || 0 },
                ]}
                keys={['count']}
                indexBy="name"
                margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
                padding={0.4}
                colors={({ id, data }) => {
                  const gradientMap = {
                    'بيع مباشر': '#f6db98ff',
                    'فريق A': '#9cc3f4ff',
                    'فريق B': '#f4b1d4ff',
                  };
                  return gradientMap[data.name] || '#ddd';
                }}
                axisBottom={{ tickSize: 5, tickPadding: 5, tickRotation: 0 }}
                axisLeft={{ tickSize: 5, tickPadding: 5, tickRotation: 0 }}
                labelSkipWidth={16}
                labelSkipHeight={12}
                labelTextColor="#fff"
                tooltip={({ id, value, indexValue }) => (
                  <div style={{ padding: '6px 10px', background: '#111', color: '#FFD700', borderRadius: '4px' }}>
                    {indexValue}: {value} عملية
                  </div>
                )}
              />
            </div>
          </StatCard>
        </div>

        <div className="bg-white/10 border border-white/10 rounded-2xl py-3 px-6 text-center mt-8">
          <h2 className="text-md font-semibold tracking-wide">فريقي</h2>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <TeamCard label="فريق A (الإحالة المباشرة)" members={stats.teamA} />
          <TeamCard label="فريق B (إحالة الإحالة)" members={stats.teamB} />
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({ title, value, children }) {
  return (
    <motion.div whileHover={{ scale: 1.03 }} className="bg-white/10 border border-white/10 rounded-2xl shadow-lg p-4 transition hover:shadow-yellow-500/20 text-center">
      <div className="text-xs font-medium mb-1">{title}</div>
      {value ? <div className="text-lg font-bold">{value}</div> : children}
    </motion.div>
  );
}

function TeamCard({ label, members }) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} className="bg-white/10 border border-white/10 rounded-2xl p-6">
      <div className="font-semibold mb-2">{label}</div>
      {members.length > 0 ? (
        <ul className="list-disc list-inside space-y-1">{members.map((m, i) => <li key={i}>{m}</li>)}</ul>
      ) : <p className="text-gray-500 italic">لا يوجد أعضاء</p>}
    </motion.div>
  );
}

function MiniCard({ title, value }) {
  return (
    <div className="bg-white/10 border border-white/20 rounded-xl text-xs px-3 py-2 shadow text-center w-[80px]">
      <div className="font-semibold text-white mb-1">{title}</div>
      <div className="text-yellow-400 font-bold">{value}</div>
    </div>
  );
}
