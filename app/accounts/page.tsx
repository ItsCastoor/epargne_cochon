'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<SharedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await api.getSharedAccounts();
        setAccounts(data as SharedAccount[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur au chargement des comptes');
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce compte ?')) {
      try {
        await api.deleteSharedAccount(id);
        setAccounts(accounts.filter((acc) => acc.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Mes Comptes Partagés</h1>
          <Link
            href="/accounts/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            + Nouveau compte
          </Link>
        </div>

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
            <Link href="/accounts/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
              Créer un compte
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {accounts.map((account) => (
              <div key={account.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{account.name}</h3>
                    <p className="text-gray-900">{account.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">
                      {account.currentAmount} / {account.targetAmount} {account.currency}
                    </p>
                    <p className="text-gray-900">
                      {Math.round((account.currentAmount / account.targetAmount) * 100)}%
                    </p>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all"
                    style={{
                      width: `${Math.min((account.currentAmount / account.targetAmount) * 100, 100)}%`,
                    }}
                  ></div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/accounts/${account.id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  >
                    Voir les détails
                  </Link>
                  <button
                    onClick={() => handleDelete(account.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}


