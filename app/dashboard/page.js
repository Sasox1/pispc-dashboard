'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';

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
    { name: 'مباشر', value: stats.totalDirectCommission },
    { name: 'إحالة', value: stats.totalReferralCommission },
    { name: 'إحالة الإحالة', value: stats.totalRofRCommission },
  ];

  const colors = ['#B8860B', '#CC5500', '#3A3A3A'];

  return (
    <div className="relative min-h-screen overflow-hidden font-sans text-[#E0E0E0]">
      {/* خلفية ثلاثية الأبعاد زجاجية */}
      <div className="absolute inset-0 -z-10">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={2} />
          <Suspense fallback={null}>
            <Environment resolution={256}>
              <Lightformer intensity={2} position={[0, 2, -5]} scale={[10, 10]} />
              <Lightformer intensity={1} position={[-5, -2, -10]} scale={[20, 10]} color="#ffaa00" />
            </Environment>
            <GlassPanel />
          </Suspense>
        </Canvas>
      </div>

      {/* المحتوى فوق الخلفية */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }} className="relative z-10 p-8 space-y-8">
        <div className="flex items-center justify-between">
          <Image src="/logo.png" alt="PISPC Logo" width={180} height={180} />
          <div className="flex flex-col gap-2">
            <div className="bg-white/10 border border-white/20 shadow px-6 py-3 rounded-xl text-sm">
              <div className="font-bold">{marketerName}</div>
            </div>
            <div className="bg-yellow-300/20 border border-yellow-300/30 shadow px-6 py-2 rounded-xl text-xs text-yellow-300 font-medium">
              {marketerTier}
            </div>
          </div>
        </div>

        <div className="bg-white/10 border border-[#FFD700]/20 rounded-2xl py-4 px-8 shadow-xl text-center">
          <h1 className="text-lg font-semibold tracking-wide">لوحة تحكم المسوق</h1>
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

        <div className="bg-white/10 border border-white/10 rounded-2xl py-3 px-6 text-center">
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
    <motion.div whileHover={{ scale: 1.03 }} className="bg-white/10 border border-white/10 rounded-2xl shadow-lg p-6 transition hover:shadow-yellow-500/20">
      <div className="text-sm mb-1 font-medium">{title}</div>
      {value ? <div className="text-2xl font-bold">{value}</div> : children}
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

// 🎯 مكون اللوح الزجاجي الشفاف
function GlassPanel() {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} scale={[10, 10, 0.5]}>
      <icosahedronGeometry args={[1, 5]} />
      <meshPhysicalMaterial
        transmission={1}
        roughness={0.15}
        thickness={1}
        clearcoat={0.8}
        metalness={0.1}
        reflectivity={0.9}
        envMapIntensity={2}
        color="#ffffff"
      />
    </mesh>
  );
}
