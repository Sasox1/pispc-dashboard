import { verifyLogin } from '@/utils/auth';

export async function POST(req) {
  const body = await req.json();
  const user = await verifyLogin(body.email, body.password);

  if (!user) {
    return Response.json({ error: 'بيانات الدخول غير صحيحة' }, { status: 401 });
  }

  return Response.json(user);
}
