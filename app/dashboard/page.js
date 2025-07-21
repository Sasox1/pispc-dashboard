// ✅ تحديث: تفعيل خلفية Vanta Fog ثلاثية الأبعاد بدون التأثير على باقي الواجهة

'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import * as THREE from 'three';
import FOG from 'vanta/dist/vanta.fog.min';

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
        highlightColor: 0xf4e2d8,
        midtoneColor: 0x333333,
        lowlightColor: 0x111111,
        baseColor: 0x000000,
        blurFactor: 0.6,
        speed: 0.5,
        zoom: 0.8,
      });
    }
    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);

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
        setMarketerTier(data.stats.marketerLevel || '');
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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
      ref={vantaRef}
      className="relative p-8 space-y-8 min-h-screen text-[#E0E0E0] font-sans overflow-hidden">

      {/* محتوى واجهة لوحة التحكم كما هو تماماً */}
      <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none" />

      {/* ✅ تابع تصميمك من هنا... كل العناصر ستبقى كما هي */}

      {/* ... محتوى الصفحة الكامل يبقى كما هو دون تعديل */}
    </motion.div>
  );
}

// ✅ بقية المكونات (StatCard و TeamCard) تبقى كما هي دون تعديل
