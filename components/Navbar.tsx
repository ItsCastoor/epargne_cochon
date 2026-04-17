'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { removeToken } from '@/lib/auth';

export function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    removeToken();
    router.push('/auth/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/dashboard" className="text-2xl font-bold">
            💰 Épargne
          </Link>

          <div className="flex gap-4">
            <Link href="/dashboard" className="hover:bg-blue-700 px-3 py-2 rounded">
              Dashboard
            </Link>
            <Link href="/accounts" className="hover:bg-blue-700 px-3 py-2 rounded">
              Comptes
            </Link>
            <Link href="/notifications" className="hover:bg-blue-700 px-3 py-2 rounded">
              Notifications
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}


