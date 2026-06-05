'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { encrypt } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const user = await prisma.employee.findUnique({
    where: { email },
  });

  if (!user) {
    // Basic redirect for now
    redirect('/login?error=Invalid credentials');
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    redirect('/login?error=Invalid credentials');
  }

  const sessionData = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name
  };

  const encryptedSessionData = await encrypt(sessionData);

  const cookieStore = await cookies();
  cookieStore.set('session', encryptedSessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 1 day
    path: '/',
  });

  redirect('/dashboard');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.set('session', '', { expires: new Date(0) });
  redirect('/login');
}
