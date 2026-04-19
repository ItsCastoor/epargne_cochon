'use client';

import { ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { getToken } from '@/lib/auth';

export function ProtectedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    // Ne vérifier qu'une seule fois au montage
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    const token = getToken();
    const isAuthPage = pathname.startsWith('/auth');
    const isRootPage = pathname === '/';

    console.log(`[ProtectedLayout] Path: ${pathname}, Token: ${token ? 'Présent' : 'Absent'}`);

    // Si pas de token ET pas sur une page publique (auth ou root)
    if (!token && !isAuthPage && !isRootPage) {
      console.log('[ProtectedLayout] Redirection vers login (pas de token)');
      router.push('/auth/login');
      return;
    }

    // Si token ET sur une page d'auth
    if (token && isAuthPage) {
      console.log('[ProtectedLayout] Redirection vers dashboard (token présent + auth page)');
      router.push('/dashboard');
      return;
    }

    // Si on est à la racine et pas de token, rediriger vers login
    if (isRootPage && !token) {
      console.log('[ProtectedLayout] Redirection root vers login (pas de token)');
      router.push('/auth/login');
      return;
    }

    // Si token et on arrive à la racine, aller au dashboard
    if (isRootPage && token) {
      console.log('[ProtectedLayout] Redirection root vers dashboard (token présent)');
      router.push('/dashboard');
      return;
    }

    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}


