'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error('[Error] Erreur détectée:', error);
  }, [error]);

  const handleRedirect = () => {
    const token = getToken();

    if (token) {
      router.push('/dashboard');
    } else {
      router.push('/auth/login');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">⚠️ Erreur</h1>
        <p className="text-gray-900 mb-2">Une erreur est survenue</p>
        <p className="text-gray-900 text-sm mb-8">{error.message || 'Erreur inconnue'}</p>

        <div className="flex gap-4">
          <button
            onClick={reset}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg"
          >
            Réessayer
          </button>
          <button
            onClick={handleRedirect}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 rounded-lg"
          >
            Retour
          </button>
        </div>
      </div>
    </div>
  );
}

