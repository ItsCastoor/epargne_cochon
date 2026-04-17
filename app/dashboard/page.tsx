'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import * as api from '@/lib/api';

interface SharedAccount {
  id: string;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
}

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<SharedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        console.log('[Dashboard] Chargement des comptes...');
        const data = await api.getSharedAccounts();
        console.log('[Dashboard] Comptes chargés:', data);
        setAccounts(data as SharedAccount[]);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur au chargement des comptes';
        console.error('[Dashboard] Erreur:', errorMessage, err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-8">Dashboard</h1>

        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-900 mb-4">Aucun compte partagé pour le moment</p>
            <a href="/accounts" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
              Créer un compte
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <div key={account.id} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition">
                <h3 className="text-xl font-bold mb-2">{account.name}</h3>
                <p className="text-gray-900 mb-4">{account.description}</p>

                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">Progression</span>
                    <span className="text-gray-900">
                      {account.currentAmount} / {account.targetAmount} {account.currency}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min((account.currentAmount / account.targetAmount) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <a
                  href={`/accounts/${account.id}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-block"
                >
                  Voir les détails
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}


