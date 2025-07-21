// page.js
'use client';

import { useEffect, useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

function GlassPanel() {
  return (
    <mesh rotation={[0, 0, 0]} position={[0, 0, -2]}>
      <planeGeometry args={[15, 10, 64, 64]} />
      <meshPhysicalMaterial
        transmission={0.9}
        roughness={0.35}
        thickness={1.5}
        clearcoat={0.9}
        metalness={0.1}
        reflectivity={0.2}
        color="#ffffff"
      />
    </mesh>
  );
}

function MovingLights() {
  const [angle, setAngle] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAngle((prev) => prev + 0.01);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <group>
      <pointLight position={[Math.sin(angle) * 5, 2, 5]} intensity={0.6} color={'#FFD700'} />
      <pointLight position={[Math.cos(angle) * -5, -2, 5]} intensity={0.4} color={'#00FFFF'} />
    </group>
  );
}

function BackgroundScene() {
  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 50 }} className="absolute top-0 left-0 w-full h-full z-0">
      <Suspense fallback={null}>
        <Environment preset="sunset" background={false} />
        <GlassPanel />
        <MovingLights />
        <ambientLight intensity={0.2} />
        <ContactShadows position={[0, -4.5, 0]} opacity={0.25} scale={10} blur={2.5} far={4.5} />
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
      </Suspense>
    </Canvas>
  );
}

// ثم ندمج هذا داخل صفحة DashboardPage

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
      .then((res) => {
        if (!res.ok) throw new Error('❌ فشل في تحميل البيانات من API');
        return res.json();
      })
      .then((data) => {
        if (!data.stats) {
          setError('❌ لم يتم استلام بيانات صالحة من السيرفر.');
          return;
        }
        setStats(data.stats);
        setMarketerName(data.stats.marketerName || '');
        setMarketerTier(data.stats.marketerLevel || '');
      })
      .catch((err) => {
        console.error('❌ خطأ أثناء التحميل:', err);
        setError('❌ فشل في تحميل البيانات من السيرفر');
      });
  }, []);

  if (error) return <div className="p-8 text-red-600 font-bold whitespace-pre-wrap">{error}\n\n{debug}</div>;
  if (!stats) return <div className="p-8 text-gray-500 animate-pulse whitespace-pre-wrap">⏳ جاري تحميل البيانات...\n\n{debug}</div>;

  const chartData = [
    { name: 'مباشر', value: stats.totalDirectCommission },
    { name: 'إحالة', value: stats.totalReferralCommission },
    { name: 'إحالة الإحالة', value: stats.totalRofRCommission },
  ];
  const colors = ['#B8860B', '#CC5500', '#3A3A3A'];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
      className="relative p-8 space-y-8 min-h-screen bg-black text-[#E0E0E0] font-sans overflow-hidden">

      {/* 🎨 خلفية ثلاثية الأبعاد */}
      <BackgroundScene />

      {/* 🧠 معلومات المسوق */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="relative">
          <Image src="/logo.png" alt="PISPC Logo" width={260} height={260} />
        </div>
        <div className="flex flex-col gap-2">
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 px-6 py-3 rounded-xl text-sm">
            <div className="text-[#E0E0E0] font-bold">{marketerName}</div>
          </div>
          <div className="bg-white/10 border border-yellow-300/30 px-6 py-2 rounded-xl text-xs text-yellow-300 font-medium">
            {marketerTier}
          </div>
        </div>
      </div>

      {/* 🧮 البطاقات */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="العمولة المباشرة" value={stats.totalDirectCommission + ' SP'} />
        <StatCard title="عمولة الإحالة" value={stats.totalReferralCommission + ' SP'} />
        <StatCard title="عمولة إحالة الإحالة" value={stats.totalRofRCommission + ' SP'} />
        <StatCard title="العمولات المدفوعة" value={stats.totalPaid} />
        <StatCard title="العمولات غير المدفوعة" value={stats.totalPending} />
        <StatCard title="عدد ترقياتك" value={stats.upgradeHistory.length} />
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
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

      {/* 👥 الفرق */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
        <TeamCard label="فريق A (الإحالة المباشرة)" members={stats.teamA} />
        <TeamCard label="فريق B (إحالة الإحالة)" members={stats.teamB} />
      </div>

      {/* 🛠️ معلومات تصحيحية */}
      <div className="relative z-10 mt-10 bg-[#1E1E1E] p-4 rounded-xl text-xs text-[#E0E0E0] whitespace-pre-wrap border border-gray-700">
        🛠️ <strong>معلومات تصحيحية (Debug Info):</strong>\n{debug}
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, children }) {
  return (
    <motion.div whileHover={{ scale: 1.03 }}
      className="backdrop-blur-lg bg-white/10 border border-white/10 rounded-2xl shadow-lg p-6">
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
