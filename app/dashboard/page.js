'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import * as THREE from 'three';

function AnimatedBackground() {
  return (
    <Canvas
      className="absolute top-0 left-0 w-full h-full z-0"
      camera={{ position: [0, 0, 10], fov: 50 }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color={"#fff8e7"} />
      <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <icosahedronGeometry args={[4, 3]} />
        <meshPhysicalMaterial
          transmission={1}
          roughness={0.3}
          thickness={1.5}
          clearcoat={1}
          metalness={0.2}
          reflectivity={0.8}
          color="#ffffff"
        />
      </mesh>
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.2} />
    </Canvas>
  );
}

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
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ marketerId })
    })
      .then((res) => {
        if (!res.ok) throw new Error('❌ فشل في تحميل البيانات من API');
        return res.json();
      })
      .then((data) => {
        console.log('✅ البيانات المستلمة من السيرفر:', data);
        if (!data.stats) {
          setError('❌ لم يتم استلام بيانات صالحة من السيرفر.');
          return;
        }
        setDebug(prev => prev + `\n✅ تم استلام البيانات من السيرفر بنجاح.\n📦 البيانات:\n${JSON.stringify(data.stats, null, 2)}`);
        setStats(data.stats);
        setMarketerName(data.stats.marketerName || '');
        setMarketerTier(data.stats.marketerTier || '');
      })
      .catch((err) => {
        console.error('❌ خطأ أثناء التحميل:', err);
        setError('❌ فشل في تحميل البيانات من السيرفر');
      });
  }, []);

  if (error) {
    return (
      <div className="p-8 text-red-600 font-bold whitespace-pre-wrap">
        {error}
        {'\n\n'}
        {debug}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 text-gray-500 animate-pulse whitespace-pre-wrap">
        ⏳ جاري تحميل البيانات...
        {'\n\n'}
        {debug}
      </div>
    );
  }

  const chartData = [
    { name: 'مباشر', value: stats.totalDirectCommission },
    { name: 'إحالة', value: stats.totalReferralCommission },
    { name: 'إحالة الإحالة', value: stats.totalRofRCommission },
  ];

  const colors = ['#B8860B', '#CC5500', '#3A3A3A'];
  const textColor = 'text-[#E0E0E0]';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
      className="relative p-8 space-y-8 min-h-screen bg-[#1A1A1A] text-[#E0E0E0] font-sans overflow-hidden">

      <AnimatedBackground />

      <div className="relative z-10 flex items-center justify-between">
        <div className="relative">
          <Image src="/logo.png" alt="PISPC Logo" width={260} height={260} />
          <div className="absolute top-0 left-0 w-full h-full rounded-full bg-white/30 blur-2xl opacity-70" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.3)] px-6 py-3 rounded-xl text-sm">
            <div className="text-[#E0E0E0] font-bold">{marketerName}</div>
          </div>
          <div className="backdrop-blur-lg bg-white/10 border border-yellow-300/30 shadow-[0_0_15px_rgba(255,215,0,0.3)] px-6 py-2 rounded-xl text-xs text-yellow-300 font-medium">
            {marketerTier}
          </div>
        </div>
      </div>

      <div className="backdrop-blur-lg bg-white/10 border border-[#FFD700]/20 rounded-2xl py-4 px-8 shadow-xl text-center">
        <h1 className="text-lg font-semibold text-[#E0E0E0] tracking-wide">لوحة تحكم المسوق</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="العمولة المباشرة" value={stats.totalDirectCommission + ' SP'} />
        <StatCard title="عمولة الإحالة" value={stats.totalReferralCommission + ' SP'} />
        <StatCard title="عمولة إحالة الإحالة" value={stats.totalRofRCommission + ' SP'} />
        <StatCard title="العمولات المدفوعة" value={stats.totalPaid} />
        <StatCard title="العمولات غير المدفوعة" value={stats.totalPending} />
        <StatCard title="عدد ترقياتك" value={stats.upgradeHistory.length} />
      </div>

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

      <div className="backdrop-blur-lg bg-white/10 border border-white/10 rounded-2xl py-3 px-6 text-center">
        <h2 className="text-md font-semibold text-[#E0E0E0] tracking-wide">فريقي</h2>
      </div>

      <div className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TeamCard label="فريق A (الإحالة المباشرة)" members={stats.teamA} />
          <TeamCard label="فريق B (إحالة الإحالة)" members={stats.teamB} />
        </div>
      </div>

      <div className="mt-10 bg-[#1E1E1E] p-4 rounded-xl text-xs text-[#E0E0E0] whitespace-pre-wrap border border-gray-700">
        🛠️ <strong>معلومات تصحيحية (Debug Info):</strong>
        {'\n'}
        {debug}
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, children }) {
  return (
    <motion.div whileHover={{ scale: 1.03 }}
      className="backdrop-blur-lg bg-white/10 border border-white/10 rounded-2xl shadow-lg p-6 transition duration-300 hover:shadow-[0_0_30px_#FFD70022]">
      <div className="text-sm text-[#E0E0E0] mb-1 font-medium">{title}</div>
      {value ? <div className="text-2xl font-bold text-[#E0E0E0]">{value}</div> : children}
    </motion.div>
  );
}

function TeamCard({ label, members }) {
  return (
    <motion.div whileHover={{ scale: 1.02 }}
      className="backdrop-blur-lg bg-white/10 border border-white/10 rounded-2xl p-6">
      <div className="text-[#E0E0E0] font-semibold mb-2">{label}</div>
      {members.length > 0 ? (
        <ul className="list-disc list-inside text-[#E0E0E0] space-y-1">
          {members.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 italic">لا يوجد أعضاء</p>
      )}
    </motion.div>
  );
}
