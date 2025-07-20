'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    const res = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const result = await res.json();

    if (result.success) {
      router.push('/dashboard');
    } else {
      setError('بيانات الدخول غير صحيحة');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>تسجيل الدخول</h2>
      <input
        type="email"
        placeholder="البريد الإلكتروني"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      /><br />
      <input
        type="password"
        placeholder="كلمة المرور"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      /><br />
      <button onClick={handleLogin}>دخول</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
