'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();

    console.log('[404] Page non trouvée - Redirection...');

    if (token) {
      console.log('[404] Token présent → Redirection vers dashboard');
      router.push('/dashboard');
    } else {
      console.log('[404] Pas de token → Redirection vers login');
      router.push('/auth/login');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-2xl font-semibold text-gray-900 mb-8">Page non trouvée</p>
        <p className="text-gray-900 mb-8">Redirection en cours...</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  );
}

