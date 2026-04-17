'use client';

import { ReactNode } from 'react';

export function ProtectedLayout({ children }: { children: ReactNode }) {
  // Le middleware gère les redirections au niveau serveur
  // Ce composant est maintenant juste un wrapper passthrough
  return <>{children}</>;
}


