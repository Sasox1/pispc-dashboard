'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [debug, setDebug] = useState('');
  const [error, setError] = useState('');
  const [marketerName, setMarketerName] = useState('');
  const [marketerTier, setMarketerTier] = useState('');
  const canvasRef = useRef(null);

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

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let lights = Array.from({ length: 10 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 80 + Math.random() * 40,
      dx: (Math.random() - 0.5) * 0.5,
      dy: (Math.random() - 0.5) * 0.5,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      lights.forEach((light) => {
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, light.r);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.arc(light.x, light.y, light.r, 0, Math.PI * 2);
        ctx.fill();
        light.x += light.dx;
        light.y += light.dy;

        if (light.x < 0 || light.x > canvas.width) light.dx *= -1;
        if (light.y < 0 || light.y > canvas.height) light.dy *= -1;
      });
      requestAnimationFrame(animate);
    };
    animate();
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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
      className="relative p-8 space-y-8 min-h-screen bg-[#1A1A1A] text-white font-sans overflow-hidden">

      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0" />

      {/* باقي المكونات تظهر هنا... */}
    </motion.div>
  );
}

function StatCard({ title, value, children }) {
  return (
    <motion.div whileHover={{ scale: 1.03 }}
      className="backdrop-blur-lg bg-white/10 border border-white/10 rounded-2xl shadow-lg p-6 transition duration-300 hover:shadow-[0_0_30px_#FFD70022]">
      <div className="text-sm text-white/80 mb-1 font-medium">{title}</div>
      {value ? <div className="text-2xl font-bold text-white">{value}</div> : children}
    </motion.div>
  );
}

function TeamCard({ label, members }) {
  return (
    <motion.div whileHover={{ scale: 1.02 }}
      className="backdrop-blur-lg bg-white/10 border border-white/10 rounded-2xl p-6">
      <div className="text-gray-200 font-semibold mb-2">{label}</div>
      {members.length > 0 ? (
        <ul className="list-disc list-inside text-white space-y-1">
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
