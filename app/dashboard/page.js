'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import * as THREE from 'three';
import FOG from 'vanta/dist/vanta.fog.min';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [debug, setDebug] = useState('');
  const [error, setError] = useState('');
  const [marketerName, setMarketerName] = useState('');
  const [marketerTier, setMarketerTier] = useState('');
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  useEffect(() => {
    if (!vantaEffect.current && vantaRef.current) {
      vantaEffect.current = FOG({
        el: vantaRef.current,
        THREE,
        mouseControls: false,
        touchControls: false,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        highlightColor: 0xffffff,
        midtoneColor: 0xf0e6d2,
        lowlightColor: 0x000000,
        baseColor: 0x1a1a1a,
        blurFactor: 0.5,
        speed: 0.5,
        zoom: 1.2,
      });
    }

    return () => {
      if (vantaEffect.current) vantaEffect.current.destroy();
    };
  }, []);

  useEffect(() => {
    const marketerId = sessionStorage.getItem('marketerId');
    if (!marketerId) {
      setError('⚠️ لم يتم العثور على بيانات الدخول (marketerId). الرجاء تسجيل الدخول مجددًا.');
      return;
    }

    fetch('/api/dashboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ marketerId }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('❌ فشل في تحميل البيانات من API');
        return res.json();
      })
      .then((data) => {
        setStats(data.stats);
        setMarketerName(data.stats.marketerName || '');
        setMarketerTier(data.stats.marketerLevel || '');
      })
      .catch(() => {
        setError('❌ فشل في تحميل البيانات من السيرفر');
      });
  }, []);

  if (error) return <div className="p-8 text-red-600 font-bold">{error}</div>;
  if (!stats) return <div className="p-8 text-gray-500 animate-pulse">⏳ جاري تحميل البيانات...</div>;

  const chartData = [
    { name: 'مباشر', value: stats.totalDirectCommission },
    { name: 'إحالة', value: stats.totalReferralCommission },
    { name: 'إحالة الإحالة', value: stats.totalRofRCommission },
  ];

  const colors = ['#B8860B', '#CC5500', '#3A3A3A'];

  return (
    <div className="relative min-h-screen overflow-hidden font-sans text-gray-200">
      {/* خلفية ثلاثية الأبعاد */}
      <div ref={vantaRef} className="absolute inset-0 z-0" />

      {/* واجهة المستخدم */}
      <div className="relative z-10 p-8 space-y-8">

        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div className="relative">
            <Image src="/logo.png" alt="PISPC Logo" width={180} height={180} />
            <div className="absolute top-0 left-0 w-full h-full rounded-full bg-white/20 blur-2xl opacity-40" />
          </div>
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 px-6 py-3 rounded-xl text-sm shadow-xl">
            <div className="text-lg font-bold text-white">{marketerName}</div>
            <div className="text-base text-[#FFD700]">{marketerTier}</div>
          </div>
        </div>

        {/* عنوان لوحة التحكم */}
        <div className="backdrop-blur-lg bg-white/10 border border-white/10 rounded-2xl p-6 shadow-xl w-full text-center">
          <h1 className="text-xl font-bold tracking-wide text-white">📊 لوحة تحكم المسوق</h1>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="العمولة المباشرة" value={stats.totalDirectCommission + ' SP'} />
          <StatCard title="عمولة الإحالة" value={stats.totalReferralCommission + ' SP'} />
          <StatCard title="عمولة إحالة الإحالة" value={stats.totalRofRCommission + ' SP'} />
          <StatCard title="العمولات المدفوعة" value={stats.totalPaid} />
          <StatCard title="العمولات غير المدفوعة" value={stats.totalPending} />
          <StatCard title="عدد ترقياتك" value={stats.upgradeHistory.length} />
        </div>

        {/* الرسوم البيانية */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard title="📊 توزيع العمولات">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </StatCard>
          <StatCard title="📈 عدد العمولات">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip />
                <Bar dataKey="value" fill="#CC5500" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </StatCard>
        </div>

        {/* مربع "فريقي" */}
        <div className="backdrop-blur-lg bg-white/10 border border-white/10 rounded-2xl p-6 shadow-xl text-center text-lg font-bold tracking-wide text-white">
          🧑‍🤝‍🧑 فريقي
        </div>

        {/* فريق A و B */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TeamCard label="فريق A (الإحالة المباشرة)" members={stats.teamA} />
          <TeamCard label="فريق B (إحالة الإحالة)" members={stats.teamB} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, children }) {
  return (
    <motion.div whileHover={{ scale: 1.02 }}
      className="backdrop-blur-md bg-white/10 border border-white/10 rounded-2xl shadow-lg p-6 transition duration-300">
      <div className="text-sm text-white/80 mb-1 font-medium">{title}</div>
      {value ? <div className="text-2xl font-bold text-white">{value}</div> : children}
    </motion.div>
  );
}

function TeamCard({ label, members }) {
  return (
    <motion.div whileHover={{ scale: 1.02 }}
      className="backdrop-blur-md bg-white/10 border border-white/10 rounded-2xl p-6">
      <div className="text-white font-semibold mb-2">{label}</div>
      {members.length > 0 ? (
        <ul className="list-disc list-inside text-white space-y-1">
          {members.map((m, i) => <li key={i}>{m}</li>)}
        </ul>
      ) : (
        <p className="text-gray-500 italic">لا يوجد أعضاء</p>
      )}
    </motion.div>
  );
}
